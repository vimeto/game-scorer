// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

import { useState } from "react";
import FlipCard from "../components/FlipCard"

// const cardVariants = {
//   selected: {
//     rotateY: 180,
//     scale: 1.1,
//     transition: { duration: .4 },
//     boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
//   },
//   notSelected: {
//     rotateY: 0,
//     scale: 1,
//     boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
//     transition: { duration: .4 }
//   },
// }

// const container = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       delayChildren: 0.2,
//     },
//   },
// }

// const item = {
//   hidden: {
//     opacity: 0,
//     transition: {
//       duration: 0.2
//     },
//   },
//   show: {
//     opacity: 1,
//     transition: {
//       duration: 0.2
//     },
//   },
// }

// const Flashcards = () => {
//     const [selected, setSelected] = useState(false);

//     const onCardPress = () => { setSelected(!selected) }

//     return (
//       <>
//         <motion.div
//           className="card w-40 h-40"
//           onClick={onCardPress}
//           variants={cardVariants}
//           animate={selected ? "selected" : "notSelected"}
//           >
//             {selected && (
//               <motion.ul
//                 variants={container}
//                 initial="hidden"
//                 animate="show"
//                 style={{ rotateY: 180 }}
//                 >
//                 <motion.li variants={item}>first</motion.li>
//                 <motion.li variants={item}>second</motion.li>
//               </motion.ul>
//             )}
//             {!selected && (
//               <motion.ul
//                 variants={container}
//                 initial="hidden"
//                 animate="show"
//                 >
//                 <motion.li variants={item}>abcdsdf</motion.li>
//                 <motion.li variants={item}>asfdafsdae</motion.li>
//               </motion.ul>
//             )}
//         </motion.div>
//       </>
//     )
// }

// export default Flashcards;


const AnimatedDiv = () => {
  const [selected, setSelected] = useState(false);

  return (
    <FlipCard shown={<div>Shown</div>} hidden={<div>Hidden</div>} selected={selected} setSelected={setSelected} />
  );
}

export default AnimatedDiv;
