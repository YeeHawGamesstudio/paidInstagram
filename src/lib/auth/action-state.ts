export type LoginFieldValues = {
  email: string;
};

export type SignupFieldValues = {
  displayName: string;
  email: string;
  role: "FAN" | "CREATOR";
};

export type LoginFieldErrors = Partial<Record<keyof LoginFieldValues | "password", string>>;
export type SignupFieldErrors = Partial<Record<keyof SignupFieldValues | "password", string>>;

export type LoginActionState = {
  message?: string;
  errors?: LoginFieldErrors;
  values?: LoginFieldValues;
};

export type SignupActionState = {
  message?: string;
  errors?: SignupFieldErrors;
  values?: SignupFieldValues;
};

export const initialLoginActionState: LoginActionState = {
  values: {
    email: "",
  },
};

export const initialSignupActionState: SignupActionState = {
  values: {
    displayName: "",
    email: "",
    role: "FAN",
  },
};
