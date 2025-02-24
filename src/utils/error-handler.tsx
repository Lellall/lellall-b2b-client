import { toast } from "react-toastify";

interface IObj {
  code: number;
  message: string;
}

interface ServerError {
  error?: {
    status: number;
    data: {
      message: string;
      status?: string;
    };
  };
  status?: string | number;
  response?: {
    data: any;
    status: number;
  };
  data?: {
    message: string;
    status: string;
  };
  body?: any;
  name?: string;
}

export const ErrorHandler = (err: ServerError, obj?: IObj | IObj[], show = true) => {
  // Development logging
  window.process = { ...window.process };
  if (process) {
    const NODE_ENV = process.env.NODE_ENV;
    if (NODE_ENV === "development") {
      console.error(err);
    }
  }

  let msg: string | undefined;
  let statusCode: number;
  const constMessage = "Sorry, an error has occurred, Please try again or if issue persist, contact support.";

  // Standard error messages mapping
  const msgObj: { [key: string]: string } = {
    "404": "The resource you're looking for cannot be found.",
    "400": "An unexpected error has occurred. Please try again.",
    "600": "An error has occurred. Please check your internet connection and retry.",
    "500": "Oops! Something went wrong. Our team is working to resolve it as quickly as possible.",
    "401": "",
    "403": "Apologies, but you do not have permission to access the requested document or program.",
    "408": "Your request is taking longer than expected. Please try again.",
    "405": "Method Not Allowed.",
    "502": "We are currently facing an issue with this service. Rest assured, we are aware of it and are working on a fix.",
    "503": "We are experiencing a temporary issue with this service. We are aware and are working to restore functionality soon.",
    "504": "Your request is taking too long to complete. Please try again.",
  };

  // Handle different error formats
  if (err.error?.data?.message) {
    msg = err.error.data.message;
    statusCode = err.error.status;
  } else if (err.data?.status === "INTERNAL_SERVER_ERROR") {
    msg = err.data.message;
    statusCode = 500;
  } else if (err.status === "INTERNAL_SERVER_ERROR") {
    msg = err.data?.message || constMessage;
    statusCode = 500;
  } else if (err.response && err.response instanceof Object) {
    statusCode = err.response.status;
    const { data } = err.response;
    msg = data?.message || data?.error || data || constMessage;
  } else if (err?.name === "ApiError") {
    statusCode = typeof err.status === "number" ? err.status : 500;
    msg = err.body?.message || err.body?.error || constMessage;
  } else {
    statusCode = 600;
    msg = constMessage;
  }

  // Handle custom error messages
  if (statusCode === 409) {
    msgObj[`${statusCode}`] = msg || msgObj[`${statusCode}`] || constMessage;
  }

  // Set default message if not in msgObj
  if (!msgObj[`${statusCode}`]) {
    msgObj[`${statusCode}`] = constMessage;
  }

  // Handle custom error objects
  if (obj) {
    if (!Array.isArray(obj)) {
      const objAsIObj = obj as IObj;
      msgObj[`${objAsIObj.code}`] = objAsIObj.message;
    } else {
      obj.forEach((x) => {
        msgObj[`${x.code}`] = x.message;
      });
    }
  }

  // Show toast notification if required
  if (show && statusCode !== 401) {
    const showMsg = msg || msgObj[statusCode];
    toast.error(showMsg, {
      position: "top-right",
    });
  }

  // Return error in the requested format
  return {
    error: {
      status: statusCode,
      data: {
        httpStatus: statusCode,
        message: msg || msgObj[statusCode],
      },
    },
    isUnhandledError: false,
  };
};