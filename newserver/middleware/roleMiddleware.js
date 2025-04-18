const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.role;
      if (!userRole) {
        const err = new Error('Роль пользователя не определена');
        err.status = 401;
        return next(err);
      }
  
      if (!allowedRoles.includes(userRole)) {
        const err = new Error('Недостаточно прав для выполнения этого действия');
        err.status = 403;
        return next(err);
      }
  
      next();
    };
  };
  
  export default roleMiddleware;