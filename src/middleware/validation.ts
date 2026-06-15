import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { UserRole, ReminderPeriod, EventStatus } from '../types';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .required(),
    phoneNumber: Joi.string().optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};

export const validateEvent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    venue: Joi.string().required(),
    location: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90),
        longitude: Joi.number().min(-180).max(180)
      }).optional()
    }).required(),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
    ticketPrice: Joi.number().min(0).required(),
    totalTickets: Joi.number().integer().min(1).required(),
    images: Joi.array().items(Joi.string()).optional(),
    status: Joi.string()
      .valid(...Object.values(EventStatus))
      .optional(),
    defaultReminder: Joi.string()
      .valid(...Object.values(ReminderPeriod))
      .optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};

export const validateTicketPurchase = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    eventId: Joi.string().required(),
    reminder: Joi.string()
      .valid(...Object.values(ReminderPeriod))
      .optional()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};

export const validatePaymentVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    reference: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};

export const validateUpdateReminder = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const schema = Joi.object({
    reminder: Joi.string()
      .valid(...Object.values(ReminderPeriod))
      .required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: error.details[0].message
    });
    return;
  }
  next();
};
