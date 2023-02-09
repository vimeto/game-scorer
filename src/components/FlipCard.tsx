import React, { type ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  selected: {
    rotateY: 180,
    // scale: 1.1,
    transition: { duration: .4 },
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
  },
  notSelected: {
    rotateY: 0,
    // scale: 1,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
    transition: { duration: .4 }
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.2
    },
  },
  show: {
    opacity: 1,
    transition: {
      duration: 0.2
    },
  },
}

const FlipCard: React.FC<{ shown: ReactNode, hidden: ReactNode, selected: boolean, setSelected: (a: boolean) => void }> = ({ shown, hidden, selected, setSelected }) => {
    // const [selected, setSelected] = useState(false);

    const onCardPress = () => { setSelected(!selected) }

    return (
      <>
        <motion.div
          className="card"
          // onClick={onCardPress}
          variants={cardVariants}
          animate={selected ? "selected" : "notSelected"}
          >
            {selected && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                style={{ rotateY: 180 }}
                >
                <motion.div variants={item}>{shown}</motion.div>
              </motion.div>
            )}
            {!selected && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                >
                <motion.div variants={item}>{hidden}</motion.div>
              </motion.div>
            )}
        </motion.div>
      </>
    )
}

export default FlipCard;
