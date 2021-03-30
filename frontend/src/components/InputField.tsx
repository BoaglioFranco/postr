import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
};

//field has .value, .name, .onChange, etc to link formik to the input

const InputField: React.FC<Props> = ({ size: _, label, textarea, ...props }) => {
  const [field, meta] = useField(props);
  let InputOrTextarea  = textarea? Textarea as any : Input;
  return (
    <FormControl isInvalid={!!meta.error}>
      <FormLabel htmlFor={props.name}>{label}</FormLabel>
      <InputOrTextarea {...field} {...props} id={field.name} placeholder={props.placeholder} />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

export default InputField;
