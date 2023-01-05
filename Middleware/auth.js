const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.roles)) {
      return next(
        new Error(
          `Role:${req.user.role} is not allow to access this resource`,
          403
        )
      );
    }
    next();
  };
};

export default authorizeRoles