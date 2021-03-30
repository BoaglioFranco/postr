import { Box, Button, Heading, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import NextLink from 'next/link';
import { withApollo } from "../utils/withApollo";

const ForgotPassword: React.FC<{}> = () => {
  const [forgotPassword, ] = useForgotPasswordMutation();
  const [state, setState] = useState({ complete: false, email: "" });
  return (
    <Wrapper width={600}>
      <Heading textAlign="center" mb={4}>
        Restore Password
      </Heading>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await forgotPassword({variables:{...values}});
          setState({ complete: true, email: values.email });
        }}
      >
        {(props) => {
          return (

            <Form>
              <InputField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              ></InputField>
              <Button mt={4} type="submit" background="teal.500" color="white" isLoading={props.isSubmitting}>
                Recover
              </Button>
              {state.complete ? (
                <Box>An email was sent to {state.email}. <NextLink href='/'><Link color='GrayText'>Go home .</Link></NextLink></Box>
              ) : null}
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ssr: false})(ForgotPassword);
