import { FieldError } from "../resolvers/FieldError";
import { UserInputType } from "../resolvers/UserInputType";

export function validateRegister(options: UserInputType): FieldError[] | null {
  const errors: FieldError[] = [];
  if (options.username.length <= 2) {
    errors.push({ field: "username", message: "Username is too short!" });
  } else if (options.username.includes("@")) {
    errors.push({ field: "username", message: "Username has invalid symbols" });
  }
  if (options.email.length <= 2 || !options.email.includes("@")) {
    errors.push({ field: "email", message: "Please enter a valid email" });
  }
  if (options.password.length <= 3) {
    errors.push({ field: "password", message: "Password is too short!" });
  }

  if (errors.length === 0) {
    return null;
  } else {
    return errors;
  }
}
