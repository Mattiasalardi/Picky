import React, { useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import SwipeCard, { SwipeDirection } from './SwipeCard';
import { Theme } from '../constants/Theme';
import { MediaAsset } from '../services/MediaLibraryService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CardStackProps {
  assets: MediaAsset[];
  currentIndex: number;
  onSwipe: (direction: SwipeDirection, asset: MediaAsset, index: number) => void;
  onLoadError?: (asset: MediaAsset) => void;
}

const STACK_SIZE = 3; // Number of cards to render
const CARD_OFFSET = 8; // Offset between stacked cards
const SCALE_FACTOR = 0.03; // How much each card scales down

export default function CardStack({ 
  assets, 
  currentIndex, 
  onSwipe, 
  onLoadError 
}: CardStackProps) {
  
  // Animated values for stack transitions
  const stackAnimation = useSharedValue(0);
  
  // Get the cards to render (current + next few)
  const cardsToRender = useMemo(() => {
    const cards = [];
    for (let i = 0; i < STACK_SIZE && currentIndex + i < assets.length; i++) {
      const asset = assets[currentIndex + i];
      if (asset) {
        cards.push({
          asset,
          index: currentIndex + i,
          stackIndex: i,
        });
      }
    }
    return cards;
  }, [assets, currentIndex]);

  // Animate stack when currentIndex changes
  useEffect(() => {
    stackAnimation.value = withSpring(0, {
      damping: 15,
      stiffness: 200,
    });
  }, [currentIndex]); // Remove stackAnimation from dependencies

  const handleSwipe = useCallback((direction: SwipeDirection, asset: MediaAsset, stackIndex: number) => {
    // Only allow swiping the top card
    if (stackIndex === 0) {
      // Animate the stack transition
      stackAnimation.value = withTiming(1, { duration: 300 }, () => {
        stackAnimation.value = 0;
      });
      
      onSwipe(direction, asset, currentIndex);
    }
  }, [stackAnimation, onSwipe, currentIndex]);

  const getCardAnimatedStyle = useCallback((stackIndex: number, isTopCard: boolean) => {
    return useAnimatedStyle(() => {
      const baseScale = 1 - (stackIndex * SCALE_FACTOR);
      const baseTranslateY = stackIndex * CARD_OFFSET;
      const baseOpacity = isTopCard ? 1 : Math.max(0.8 - (stackIndex * 0.1), 0.4);
      
      // During transition, move cards up in the stack
      const animationOffset = stackAnimation.value * CARD_OFFSET;
      const animationScale = stackAnimation.value * SCALE_FACTOR;
      
      return {
        transform: [
          { 
            scale: Math.min(baseScale + animationScale, 1),
          },
          { 
            translateY: Math.max(baseTranslateY - animationOffset, 0),
          },
        ],
        opacity: Math.min(baseOpacity + (stackAnimation.value * 0.1), 1),
        zIndex: STACK_SIZE - stackIndex,
      };
    });
  }, [stackAnimation]);

  if (cardsToRender.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {cardsToRender.map(({ asset, index, stackIndex }) => {
        const isTopCard = stackIndex === 0;
        
        return (
          <Animated.View
            key={asset.id}
            style={[
              styles.cardWrapper,
              getCardAnimatedStyle(stackIndex, isTopCard),
            ]}
            pointerEvents={isTopCard ? 'auto' : 'none'} // Only top card should be interactive
          >
            <SwipeCard
              asset={asset}
              onSwipe={(direction) => handleSwipe(direction, asset, stackIndex)}
              onLoadError={onLoadError}
              index={index}
              isTopCard={isTopCard}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});