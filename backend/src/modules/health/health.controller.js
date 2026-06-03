export const health =
  async (req, res) => {
    return res.status(200).json({
      success: true,

      status: "OK",

      uptime:
        process.uptime(),

      timestamp:
        new Date().toISOString(),
    });
  };