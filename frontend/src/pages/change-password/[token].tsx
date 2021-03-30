import { Heading, Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenErrors, setTokenErrors] = useState("");
  return (
    <Wrapper width={600}>
      <Heading mb={4} textAlign="center">
        Change Password
      </Heading>
      <Formik
        initialValues={{ password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.password,
            token:
              typeof router.query.token === "string" ? router.query.token : "",
          });
          if (response.data?.changePassword.errors) {
            const mappedErrors = toErrorMap(
              response.data.changePassword.errors
            );
            console.log(mappedErrors);
            if ("token" in mappedErrors) {
              setTokenErrors(mappedErrors.token);
            }
            setErrors(mappedErrors);
          } else if (response.data?.changePassword.user) {
            //register succeded
            router.push("/");
          }
        }}
      >
        {(props) => {
          return (
            <Form>
              <Box my={4}>
                <InputField
                  name="password"
                  label="Password"
                  placeholder="Password"
                  type="password"
                ></InputField>
              </Box>
              {tokenErrors ? (
                <Flex>
                  <Box color="red" mr={2}>
                    {tokenErrors}.{" "}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>Get a new one</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button type="submit" isLoading={props.isSubmitting}>
                Submit
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword as any);
