/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { generateInvoicePdf } from "./payment.utils";

/**
 * Handles Stripe Webhook events to reconcile payments and notify patients.
 */
const handlerStripeWebhookEventInDB = async (event: Stripe.Event) => {
  // Check for idempotency to avoid processing the same event twice
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      // Extract metadata provided during Stripe session creation
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("⚠️ Missing metadata in webhook event");
        return { message: "Missing metadata" };
      }

      // Verify appointment exists with all relations needed for invoice and email
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          doctor: true,
          schedule: true,
          payment: true,
        },
      });

      if (!appointment) {
        console.error(`⚠️ Appointment ${appointmentId} not found.`);
        return { message: "Appointment not found" };
      }

      let pdfBuffer: Buffer | null = null;

      // Wrap database updates and file processing in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update appointment payment status
        const updatedAppointment = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        let invoiceUrl = null;

        // Generate and upload invoice only if payment is successful
        if (session.payment_status === "paid") {
          try {
            // Generate the PDF buffer
            pdfBuffer = await generateInvoicePdf({
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate: appointment.schedule.startDateTime.toString(),
              amount: appointment.payment?.amount || 0,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toISOString(),
            });

            // Upload the generated buffer to Cloudinary
            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`,
            );

            invoiceUrl = cloudinaryResponse?.secure_url;
            console.log(
              `✅ Invoice PDF generated and uploaded for payment ${paymentId}`,
            );
          } catch (pdfError) {
            console.error(
              "❌ Error generating/uploading invoice PDF:",
              pdfError,
            );
            // We do not throw here to ensure the payment status still updates even if PDF fails
          }
        }

        // Update payment record with gateway data and the new invoice URL
        const updatedPayment = await tx.payment.update({
          where: { id: paymentId },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session,
            invoiceUrl: invoiceUrl, // Store the Cloudinary link
            stripeEventId: event.id, // Mark event as processed
          },
        });

        return { updatedAppointment, updatedPayment, invoiceUrl };
      });

      // Send confirmation email with PDF attachment outside the transaction
      if (session.payment_status === "paid" && result.invoiceUrl) {
        try {
          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              patientName: appointment.patient.name,
              invoiceId: appointment.payment?.id || paymentId,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toLocaleDateString(),
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              invoiceUrl: result.invoiceUrl,
            },
            attachments: [
              {
                filename: `Invoice-${paymentId}.pdf`,
                content: pdfBuffer || Buffer.from(""), // Attach the buffer generated earlier
                contentType: "application/pdf",
              },
            ],
          });
          console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
        } catch (emailError) {
          console.error("❌ Error sending invoice email:", emailError);
        }
      }

      console.log(`✅ Payment processed for appointment ${appointmentId}`);
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(`Checkout session ${session.id} expired.`);
      break;
    }

    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(`Payment intent ${session.id} failed.`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
  handlerStripeWebhookEventInDB,
};
