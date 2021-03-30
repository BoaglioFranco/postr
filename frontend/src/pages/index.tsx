import { withUrqlClient } from "next-urql";
import Navbar from "../components/navbar";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import React, { useState } from "react";
import { Box, Button, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { usePostsQuery } from "../generated/graphql";
import Wrapper from "../components/Wrapper";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { withApollo } from "../utils/withApollo";
import { isServer } from "../utils/isServer";

const Index = () => {

  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: { cursor: null as null | string, limit: 4 },
  });


  if (!data && !loading) {
    return (
      <Layout>
        <Text fontSize="5xl">Oops, something went wrong!</Text>
      </Layout>
    );
  }

  let body;
  if (!data && loading) {
    body = <div>Loading...</div>;
  }
  if (data?.posts) {
    let posts = data.posts.posts.map((post) =>
      !post ? null /*urql shit*/ : (
        <PostCard post={post} key={post.id}></PostCard>
      )
    );

    body = (
      <>
        <Stack spacing={8}>{posts}</Stack>
        {data.posts.hasMore ? (
          <Button
            my={6}
            display="block"
            mx="auto"
            isLoading={loading}
            onClick={() => {
              fetchMore({variables: {
                limit: variables?.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              }})
            }}
          >
            Load more
          </Button>
        ) : null}
      </>
    );
  }
  return (
    <>
      <Navbar></Navbar>
      <Wrapper width={900}>
        <NextLink href="/create-post">
          <Link>Create post</Link>
        </NextLink>
        {body}
      </Wrapper>
    </>
  );
};

export default withApollo({ssr: true})(Index);
