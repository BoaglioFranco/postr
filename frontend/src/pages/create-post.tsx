import { Heading, Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { UseAuthGuard } from "../utils/UseAuthGuard";
import { withApollo } from "../utils/withApollo";

interface Props {}

const CreatePost: React.FC<Props> = (props) => {
  UseAuthGuard();
  const router = useRouter();
  const [createPost] = useCreatePostMutation();
  return (
    <Layout containerWidth={600}>
      <Heading mb={4}>Create a Post</Heading>
      <Formik
        initialValues={{ title: "", text: "" }}
        validate={(values) => {
          let errors: any = {};
          if (!values.title) {
            errors.title = "Field Required";
          }
          if (!values.text) {
            errors.text = "Field Required";
          }
          return errors;
        }}
        onSubmit={async (values, {}) => {
          const response = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: "posts:{}" });
            },
          });
          router.push("/");
        }}
      >
        {(props) => {
          return (
            <Form>
              <InputField
                name="title"
                label="Post Title"
                placeholder="Title"
              ></InputField>
              <Box my={4}>
                <InputField
                  name="text"
                  label="Content"
                  placeholder="Post Text"
                  textarea
                ></InputField>
              </Box>
              <Button type="submit" isLoading={props.isSubmitting}>
                Submit
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(CreatePost);
