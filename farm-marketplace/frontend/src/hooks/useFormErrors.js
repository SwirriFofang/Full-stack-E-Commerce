import { useState } from "react";

// Shows a field's error after the person leaves the field, or after they press the button.
// "errors" is { field: "message" } with only the fields that have a problem,
// in the same order as the form.
export default function useFormErrors(errors, prefix) {
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  return {
    id: (field) => `${prefix}-${field}`,
    shown: (field) => (touched[field] || submitted ? errors[field] : undefined),
    touch: (field) => () => setTouched((t) => ({ ...t, [field]: true })),
    // Call this on submit. It returns true when nothing needs fixing,
    // and otherwise puts the cursor in the first wrong field.
    validate: () => {
      setSubmitted(true);
      const first = Object.keys(errors)[0];
      if (first) document.getElementById(`${prefix}-${first}`)?.focus();
      return !first;
    },
  };
}