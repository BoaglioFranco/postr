import { Box, Divider, Heading, Text, Link } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import UpvoteArea from "./UpvoteArea";
import NextLink from "next/link";

interface Props {
  post: Partial<PostSnippetFragment>;
}

const PostCard: React.FC<Props> = ({ post }) => {
  return (
    <Box p={5} pb={0} shadow="md" borderWidth="1px">
      <NextLink href={`/post/${post.id}`}>
        <Link>
          <Heading fontSize="xl">{post.title}</Heading>
        </Link>
      </NextLink>
      <Text>Posted by: {post.creator?.username}</Text>
      <Text mt={4}>{post.textSnippet}</Text>
      <Divider />
      <UpvoteArea post={post} />
    </Box>
  );
};

export default PostCard;
