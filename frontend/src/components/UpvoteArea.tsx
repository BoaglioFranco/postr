import { IconButton } from "@chakra-ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface Props {
  post: Partial<PostSnippetFragment>;
}

const UpvoteArea: React.FC<Props> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    "up-loading" | "not-loading" | "down-loading"
  >("not-loading");
  const [vote] = useVoteMutation();
  const upClickHandler = async () => {
    if (post.voteStatus === 1) {
      return;
    }
    setLoadingState("up-loading");
    await vote({ variables: { value: 1, postId: post.id! } });
    setLoadingState("not-loading");
  };
  const downClickHandler = async () => {
    if (post.voteStatus === -1) {
      return;
    }
    setLoadingState("down-loading");
    vote({ variables: { value: -1, postId: post.id! } });
    setLoadingState("not-loading");
  };

  return (
    <Flex alignItems="center" pt={2}>
      <IconButton
        onClick={upClickHandler}
        style={{ boxShadow: "none !important" }}
        background="transparent"
        borderRadius="full"
        aria-label="upvote"
        icon={<ArrowUpIcon />}
        color={post.voteStatus === 1 ? "green.500" : ""}
        _hover={{
          background: "green.50",
          color: "green.400",
        }}
        isLoading={loadingState === "up-loading"}
      />
      <IconButton
        onClick={downClickHandler}
        style={{ boxShadow: "none !important" }}
        background="transparent"
        borderRadius="full"
        aria-label="upvote"
        icon={<ArrowDownIcon />}
        color={post.voteStatus === -1 ? "red.500" : ""}
        _hover={{
          background: "red.50",
          color: "red.400",
        }}
        isLoading={loadingState === "down-loading"}
      />
      <Text pl={2}>{post.points}</Text>
    </Flex>
  );
};

export default UpvoteArea;
