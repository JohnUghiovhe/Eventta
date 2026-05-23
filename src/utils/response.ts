import { Response } from 'express';
import { SYSTEM_MESSAGES } from './systemMessages';

export const res = {
  ok: (res: Response, code = 200, msg = SYSTEM_MESSAGES.responses.success, data?: any) => 
    res.status(code).json({ status: 'success', message: msg, ...(data && { data }) }),
  
  err: (res: Response, code = 400, msg = SYSTEM_MESSAGES.responses.error) => 
    res.status(code).json({ status: 'error', message: msg }),
  
  created: (res: Response, msg = SYSTEM_MESSAGES.responses.created, data?: any) =>
    res.status(201).json({ status: 'success', message: msg, ...(data && { data }) }),
  
  unauthorized: (res: Response, msg = SYSTEM_MESSAGES.responses.unauthorized) =>
    res.status(401).json({ status: 'error', message: msg }),
  
  forbidden: (res: Response, msg = SYSTEM_MESSAGES.responses.forbidden) =>
    res.status(403).json({ status: 'error', message: msg }),
  
  notFound: (res: Response, msg = SYSTEM_MESSAGES.responses.notFound) =>
    res.status(404).json({ status: 'error', message: msg }),
};
