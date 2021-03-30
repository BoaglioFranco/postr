import { Box, Button, Heading, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import InputField from "../components/InputField";
import { MeDocument, MeQuery, useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import CenteredBox from "../components/CenteredBox";
import NextLink from "next/link";
import { withApollo } from "../utils/withApollo";

interface Props {}

const Register: React.FC<Props> = (props) => {
  const router = useRouter();
  const [register, {}] = useRegisterMutation();
  return (
    <>
      <Box pos="fixed" top={16} left={16} fontSize="lg">
        <NextLink href="/">
          <Link>Home</Link>
        </NextLink>
      </Box>
      <CenteredBox>
        <Heading mb={8}>Register</Heading>
        <Formik
          initialValues={{ username: "", password: "", email: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await register({
              variables: { options: values },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.register.user,
                  },
                });
              },
            });
            console.log(response);
            if (response.data?.register.errors) {
              setErrors(toErrorMap(response.data.register.errors));
            } else if (response.data?.register.user) {
              //register succeded
              router.push("/");
            }
          }}
        >
          {(props) => {
            return (
              <Form>
                <Box my={6}>
                  <InputField
                    name="email"
                    label="Email"
                    placeholder="Password"
                    type="email"
                  ></InputField>
                </Box>
                <Box my={6}>
                  <InputField
                    name="username"
                    label="Username"
                    placeholder="Username"
                  ></InputField>
                </Box>
                <Box my={6}>
                  <InputField
                    name="password"
                    label="Password"
                    placeholder="Password"
                    type="password"
                  ></InputField>
                </Box>
                <Button type="submit" isLoading={props.isSubmitting}>
                  Submit
                </Button>
              </Form>
            );
          }}
        </Formik>
      </CenteredBox>
    </>
  );
};

export default withApollo({ ssr: false })(Register);
