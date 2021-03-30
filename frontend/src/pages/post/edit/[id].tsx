import { Heading, Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { withApollo } from "../../../utils/withApollo";

interface Props {}

const EditPost: React.FC<Props> = (props) => {
  const router = useRouter();
  const postId: number =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { loading, data } = usePostQuery({
    skip: postId === -1,
    variables: { id: postId },
  });

  const [updatePost, { loading: updateFetching }] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <Box p={8} m="auto">
          Loading...
        </Box>
      </Layout>
    );
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box p={8} m="auto">
          Could not find post
        </Box>
      </Layout>
    );
  }

  console.log("refresh");

  return (
    <Layout containerWidth={600}>
      <Heading mb={4}>Update your post</Heading>
      <Formik
        initialValues={{ title: data?.post?.title, text: data?.post?.text }}
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
          const response = await updatePost({
            variables: { id: postId, ...values },
          });
          router.back();
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
              <Button
                type="submit"
                isLoading={updateFetching}
                disabled={postId === -1}
              >
                Update post
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};

export default withApollo({ssr: false})(EditPost);
