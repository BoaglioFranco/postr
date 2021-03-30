import { Heading, Text} from "@chakra-ui/layout";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import Fullpost from "../../components/Fullpost";
import Layout from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { withApollo } from "../../utils/withApollo";

interface Props {}

const Post: React.FC<Props> = (props) => {
  const router = useRouter();
  const intId =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { loading, data } = usePostQuery({
    skip: intId === -1 /*dont run query */,
    variables: { id: intId },
  });

  if (loading) {
    return (
      <Layout>
        <div>loading...</div>
      </Layout>
    );
  } else if (!data?.post) {
    return (
      <Layout>
        <div>Could not find post</div>
      </Layout>
    );
  } else {
    return (
      <Layout>
       <Fullpost post={data.post}/>
      </Layout>
    );
  }
};

export default withApollo({ssr: true})(Post);
