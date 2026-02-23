import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../shared/sendResponse";
import { IQueryParams } from "../../interfaces";

const giveReview = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await ReviewService.giveReviewInDB(user, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ReviewService.getAllReviewsFromDB(query as IQueryParams);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieval successfully",
    meta: result.meta, // Added meta for pagination
    data: result.data,
  });
});

const myReviews = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await ReviewService.myReviewsFromDB(user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews retrieval successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const reviewId = req.params.id;
  const payload = req.body;

  const result = await ReviewService.updateReviewInDB(
    user,
    reviewId as string,
    payload,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const reviewId = req.params.id;
  const result = await ReviewService.deleteReviewFromDB(
    user,
    reviewId as string,
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
