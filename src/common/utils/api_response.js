
class ApiResponse {
  static ok(res, message, data = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, message, data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  // This is not limited to these object's we will add more in future...
}

export default ApiResponse;
