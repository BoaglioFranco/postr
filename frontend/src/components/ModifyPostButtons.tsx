import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/layout";
import { IconButton } from "@chakra-ui/react";
import React, { MouseEventHandler } from "react";

interface Props {
  onDeleteClick: MouseEventHandler;
  onEditClick: MouseEventHandler;
}

const ModifyPostButtons: React.FC<Props> = ({ onDeleteClick, onEditClick }) => {
  return (
    <Box>
      <IconButton
        onClick={onDeleteClick}
        backgroundColor="red.500"
        aria-label="Delete post"
        icon={<DeleteIcon />}
        _hover={{ backgroundColor: "red.300" }}
      />
      <IconButton
        onClick={onEditClick}
        aria-label="Edit post"
        icon={<EditIcon />}
      />
    </Box>
  );
};

export default ModifyPostButtons;
