// Usage: router.post("/register", validate(registerSchema), controller)

// validate(schema)           -> checks req.body
// validate(schema, "query")  -> checks req.query, result in req.validatedQuery
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      if (source === "query") req.validatedQuery = parsed;
      else req[source] = parsed;
      next();
    } catch (err) {
      next(err);
    }
  };