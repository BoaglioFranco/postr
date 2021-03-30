import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/layout";
import { Heading, IconButton, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { useDeletePostMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import ModifyPostButtons from "./ModifyPostButtons";

interface PostData {
  id: number;
  title: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
  points: number;
  voteStatus?: number | null;
  creator: {
    id: number;
    username: string;
  };
}

interface Props {
  post: PostData;
}

const Fullpost: React.FC<Props> = ({ post }) => {
  const [deletePost, { data }] = useDeletePostMutation();
  const { data: meData } = useMeQuery({ skip: isServer() });

  const router = useRouter();
  const deleteButtonAction = async () => {
    await deletePost({
      variables: { id: post.id },
      update: (cache) => { //removes the post from the cache on delete click
        cache.evict({id: `Post:${post.id}`});
      },
    });
    router.push("/");
  };

  const editButtonAction = async () => {
    router.push(`/post/edit/${post.id}`);
  };

  return (
    <Box>
      <Heading>{post.title}</Heading>
      <Text>{post.text}</Text>
      {meData?.me?.id === post.creator.id ? (
        <ModifyPostButtons
          onDeleteClick={deleteButtonAction}
          onEditClick={editButtonAction}
        ></ModifyPostButtons>
      ) : null}
    </Box>
  );
};

export default Fullpost;
