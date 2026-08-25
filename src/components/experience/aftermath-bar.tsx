"use client";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type AftermathBarProps = {
  canDrawAgain: boolean;
  onDrawAgain: () => void;
  onReturn: () => void;
  onArchive: () => void;
};

export function AftermathBar({
  canDrawAgain,
  onDrawAgain,
  onReturn,
  onArchive,
}: AftermathBarProps) {
  return (
    <motion.div
      className="flex flex-wrap items-center justify-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {canDrawAgain ? (
        <Button className="ritual-btn" onClick={onDrawAgain}>
          Draw again
        </Button>
      ) : null}
      <Button className="ritual-btn" onClick={onArchive}>
        Archive
      </Button>
      <Button className="ritual-btn" onClick={onReturn}>
        Return
      </Button>
    </motion.div>
  );
}
