import {
    Button,
    ButtonGroup,
    ButtonIcon,
    ButtonSpinner,
    ButtonText,
} from "@gluestack-ui/themed";
import React from "react";
import { StyleSheet, View } from "react-native";

// ============================================
// BASIC BUTTON VARIANTS
// ============================================

interface BasicButtonProps {
  title: string;
  onPress?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

// Primary Button - Solid style
export const PrimaryButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      size="md"
      variant="solid"
      action="primary"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// Secondary Button - Outline style
export const SecondaryButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      size="md"
      variant="outline"
      action="secondary"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// Danger Button - For destructive actions
export const DangerButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      size="md"
      variant="solid"
      action="negative"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// Success Button - For positive actions
export const SuccessButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      size="md"
      variant="solid"
      action="positive"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// Link Button - Text-only style
export const LinkButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
}) => {
  return (
    <Button
      size="md"
      variant="link"
      action="primary"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// ============================================
// BUTTON SIZES
// ============================================

interface SizeButtonProps extends BasicButtonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const SizedButton: React.FC<SizeButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  size = "md",
}) => {
  return (
    <Button
      size={size}
      variant="solid"
      action="primary"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// ============================================
// BUTTON WITH ICON
// ============================================

interface IconButtonProps extends BasicButtonProps {
  icon?: React.ComponentType<any>;
  iconPosition?: "left" | "right";
}

export const IconButton: React.FC<IconButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
  icon,
  iconPosition = "left",
}) => {
  return (
    <Button
      size="md"
      variant="solid"
      action="primary"
      isDisabled={isDisabled}
      onPress={onPress}
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      {icon && iconPosition === "left" && <ButtonIcon as={icon} mr="$2" />}
      <ButtonText>{title}</ButtonText>
      {icon && iconPosition === "right" && <ButtonIcon as={icon} ml="$2" />}
    </Button>
  );
};

// ============================================
// FULL WIDTH BUTTON
// ============================================

export const FullWidthButton: React.FC<BasicButtonProps> = ({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <Button
      size="lg"
      variant="solid"
      action="primary"
      isDisabled={isDisabled}
      onPress={onPress}
      width="100%"
    >
      {isLoading && <ButtonSpinner mr="$2" />}
      <ButtonText>{title}</ButtonText>
    </Button>
  );
};

// ============================================
// BUTTON GROUP COMPONENT
// ============================================

interface ButtonGroupComponentProps {
  children: React.ReactNode;
  direction?: "row" | "column";
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const ButtonGroupComponent: React.FC<ButtonGroupComponentProps> = ({
  children,
  direction = "row",
  spacing = "md",
}) => {
  return (
    <ButtonGroup flexDirection={direction} space={spacing}>
      {children}
    </ButtonGroup>
  );
};

// ============================================
// DEMO COMPONENT - Hiển thị tất cả các button
// ============================================

export const ButtonDemo: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Primary Variants */}
      <View style={styles.section}>
        <View style={styles.row}>
          <PrimaryButton
            title="Primary"
            onPress={() => console.log("Primary")}
          />
          <SecondaryButton
            title="Secondary"
            onPress={() => console.log("Secondary")}
          />
        </View>
        <View style={styles.row}>
          <DangerButton title="Danger" onPress={() => console.log("Danger")} />
          <SuccessButton
            title="Success"
            onPress={() => console.log("Success")}
          />
        </View>
        <View style={styles.row}>
          <LinkButton title="Link Button" onPress={() => console.log("Link")} />
        </View>
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <View style={styles.row}>
          <SizedButton title="XS" size="xs" />
          <SizedButton title="SM" size="sm" />
          <SizedButton title="MD" size="md" />
        </View>
        <View style={styles.row}>
          <SizedButton title="LG" size="lg" />
          <SizedButton title="XL" size="xl" />
        </View>
      </View>

      {/* States */}
      <View style={styles.section}>
        <View style={styles.row}>
          <PrimaryButton title="Loading..." isLoading={true} />
          <PrimaryButton title="Disabled" isDisabled={true} />
        </View>
      </View>

      {/* Full Width */}
      <View style={styles.section}>
        <FullWidthButton title="Full Width Button" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
});

export default {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  LinkButton,
  SizedButton,
  IconButton,
  FullWidthButton,
  ButtonGroupComponent,
  ButtonDemo,
};
