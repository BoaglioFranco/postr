import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import InputField from "../components/InputField";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import NextLink from "next/link";
import CenteredBox from "../components/CenteredBox";
import { withApollo } from "../utils/withApollo";

interface Props {}

const Login: React.FC<Props> = (props) => {
  const router = useRouter();
  const [login, {}] = useLoginMutation();
  return (
    <>
      <Box pos="fixed" top={16} left={16} fontSize="lg">
        <NextLink href="/">
          <Link>Home</Link>
        </NextLink>
      </Box>
      <CenteredBox>
        <Heading mb={8}>Login</Heading>
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login({
              variables: { ...values },
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.login.user,//setting me to the logged user after login
                  },
                });
                cache.evict({ fieldName: "posts:{}" }); //so upvotes show up
              },
            });
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              //login succeded
              if (typeof router.query.from === "string") {
                router.push(router.query.from);
              } else {
                router.push("/");
              }
            }
          }}
        >
          {(props) => {
            return (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  label="Username or Email"
                  placeholder="Username or Email"
                ></InputField>
                <Box my={6}>
                  <InputField
                    name="password"
                    label="Password"
                    placeholder="Password"
                    type="password"
                  ></InputField>
                </Box>
                <Flex justify="flex-end">
                  <NextLink href="/forgot-password">
                    <Link>Forgot your password?</Link>
                  </NextLink>
                </Flex>
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

export default withApollo({ ssr: false })(Login);
