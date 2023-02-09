import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

const cards = [1, 2, 3, 4, 5];
const cardVariants = {
  selected: {
    rotateY: 180,
    scale: 1.1,
    transition: { duration: .35 },
    zIndex: 10,
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px'
  },
  notSelected: (i: number) => ({
    rotateY: i * 15,
    scale: 1 - Math.abs(i * 0.15),
    x: i ? i * 50 : 0,
    opacity: 1 - Math.abs(i * .15),
    zIndex: 10 - Math.abs(i),
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px',
    transition: { duration: .35 }
  })
}

const Flashcards = () => {
    const [selectedCard, setSelectedCard] = useState<number | null>(null);
    const [{
      startX,
      startScrollLeft,
      isDragging
    }, setDragStart] = useState({
      startX: undefined as number | undefined,
      startScrollLeft: undefined as number | undefined,
      isDragging: false
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    // const cardRefs = useRef<ForwardRefComponent<HTMLDivElement, HTMLMotionProps<"div">>[]>([]);

    useEffect(() => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        const halfScroll = (scrollWidth - clientWidth) / 2;
        containerRef.current.scrollLeft = halfScroll;
      }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
      setDragStart({
        startX: e.pageX - (containerRef.current?.offsetLeft || 0),
        startScrollLeft: containerRef.current?.scrollLeft,
        isDragging: true
      });
    }
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || selectedCard || !containerRef.current) return;
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = x - (startX || 0);
      containerRef.current.scrollLeft = (startScrollLeft || 0) - walk;
    }
    const selectCard = (card: number) => {
      setSelectedCard(selectedCard ? null : card);

      if (card && !selectedCard && cardRefs.current?.length > 0) {
        cardRefs.current.at(card - 1)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
    const handleCardMouseUp = (e: React.MouseEvent, card: number) => {
      if (isDragging) {
        const x = e.pageX - (containerRef.current?.offsetLeft || 0);
        const walk = x - (startX || 0);
        if (Math.abs(walk) < 5) selectCard(card);
      } else selectCard(card);
    }
    return (
      <div
        className="flashcards"
        onMouseDown={handleMouseDown}
        onMouseUp={() => setDragStart(prev => ({ ...prev, isDragging: false }))}
        onMouseMove={handleMouseMove}
      >
        <div
          className="flashcards__container"
          ref={containerRef}
        >
          {cards.map((card, i) => (
            <motion.div
              className="card w-40 h-40"
              key={card}
              ref={el => cardRefs.current.push(el)}
              onMouseUp={e => handleCardMouseUp(e, card)}
              variants={cardVariants}
              animate={selectedCard === card ? "selected" : "notSelected"}
              custom={selectedCard ? selectedCard - card : 0}
            />
          ))}
        </div>
      </div>
    )
}

export default Flashcards;
