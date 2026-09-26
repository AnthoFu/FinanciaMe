/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    primary: 'rgb(0, 122, 255)',
    background: '#ffffff',
    card: '#ffffff',
    text: '#11181C',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primaryButtonText: '#ffffff',
  },
  dark: {
    primary: 'rgb(10, 132, 255)',
    background: '#151718',
    card: 'rgb(18, 18, 18)',
    text: '#ECEDEE',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primaryButtonText: '#151718',
  },
};
