export const logger = {
  info(message, meta = {}) {
    console.log(
      JSON.stringify({
        level: "INFO",
        time: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },

  warn(message, meta = {}) {
    console.warn(
      JSON.stringify({
        level: "WARN",
        time: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },

  error(message, meta = {}) {
    console.error(
      JSON.stringify({
        level: "ERROR",
        time: new Date().toISOString(),
        message,
        ...meta,
      })
    );
  },
};