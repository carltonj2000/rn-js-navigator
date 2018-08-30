import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder
} from "react-native";

const { width } = Dimensions.get("window");

export const Route = () => null;

const buildSceneConfig = (children = []) => {
  const config = {};

  children.forEach(child => {
    config[child.props.name] = {
      key: child.props.name,
      component: child.props.component
    };
  });

  return config;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row"
  },
  scene: {
    ...StyleSheet.absoluteFillObject,
    flex: 1
  }
});
export class Navigator extends Component {
  constructor(props) {
    super(props);
    const sceneConfig = buildSceneConfig(props.children);
    const initialSceneName = props.children[0].props.name;
    this.state = { sceneConfig, stack: [sceneConfig[initialSceneName]] };
  }
  _animatedValue = new Animated.Value(0);
  _panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isFirstScreen = this.state.stack.length === 1;
      const isFarLef = evt.nativeEvent.pageX < Math.floor(width * 0.25);
      if (!isFirstScreen && isFarLef) return true;
      else return false;
    },
    onPanResponderMove: (evt, gestureState) => {
      this._animatedValue.setValue(gestureState.moveX);
    },
    onPanResponderTerminationRequest: (evt, gestureState) => true,
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.floor(gestureState.moveX) >= (width * 3) / 4) {
        this.handlePop();
      } else {
        Animated.timing(this._animatedValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }).start();
      }
    },
    onPanResponderTerminate: (evt, gestureState) => {
      Animated.timing(this._animatedValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }).start();
    }
  });
  handlePush = sceneName =>
    this.setState(
      state => ({
        stack: [...state.stack, state.sceneConfig[sceneName]]
      }),
      () => {
        this._animatedValue.setValue(width);
        Animated.timing(this._animatedValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }).start();
      }
    );
  handlePop = () =>
    Animated.timing(this._animatedValue, {
      toValue: width,
      duration: 250,
      useNativeDriver: true
    }).start(() => {
      // then end animation value is use after the present screen is pop'ed
      // of the stack below which is off screen so zero it below.
      this._animatedValue.setValue(0);
      this.setState(({ stack }) => {
        return {
          stack: stack.length > 1 ? stack.slice(0, stack.length - 1) : stack
        };
      });
    });

  render() {
    return (
      <View style={styles.container} {...this._panResponder.panHandlers}>
        {this.state.stack.map(({ component: CurrentScene, key }, index) => (
          <Animated.View
            style={
              index === this.state.stack.length - 1 && index > 0
                ? [
                    styles.scene,
                    {
                      transform: [{ translateX: this._animatedValue }]
                    }
                  ]
                : [styles.scene]
            }
            key={key}
          >
            <CurrentScene
              navigator={{ push: this.handlePush, pop: this.handlePop }}
            />
          </Animated.View>
        ))}
      </View>
    );
  }
}
