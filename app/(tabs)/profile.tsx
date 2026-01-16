import { Avatar, Container, Divider, Header, ListItem } from '@/components';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <Container safeAreaEdges={['top']}>
      <Header
        title="Cá nhân"
        rightIcon="settings-outline"
        onRightPress={() => {
          // TODO: Navigate to settings
        }}
      />
      <ScrollView className="flex-1">
        {/* Profile Header */}
        <View className="items-center py-6 bg-white">
          <Avatar
            name="User"
            size="2xl"
            showOnline
            isOnline
          />
          <View className="mt-4 items-center">
            {/* User name will be displayed here */}
          </View>
        </View>

        <Divider className="h-2 bg-background-secondary" />

        {/* Profile Menu */}
        <View className="py-2">
          <ListItem
            leftIcon="person-outline"
            title="Thông tin cá nhân"
            onPress={() => {
              // TODO: Navigate to edit profile
            }}
          />
          <Divider />
          <ListItem
            leftIcon="wallet-outline"
            title="Ví của tôi"
            onPress={() => {
              // TODO: Navigate to wallet
            }}
          />
          <Divider />
          <ListItem
            leftIcon="cloud-outline"
            title="Cloud của tôi"
            onPress={() => {
              // TODO: Navigate to cloud storage
            }}
          />
        </View>

        <Divider className="h-2 bg-background-secondary" />

        <View className="py-2">
          <ListItem
            leftIcon="shield-checkmark-outline"
            title="Tài khoản và bảo mật"
            onPress={() => {
              // TODO: Navigate to security settings
            }}
          />
          <Divider />
          <ListItem
            leftIcon="lock-closed-outline"
            title="Quyền riêng tư"
            onPress={() => {
              // TODO: Navigate to privacy settings
            }}
          />
        </View>

        <Divider className="h-2 bg-background-secondary" />

        <View className="py-2">
          <ListItem
            leftIcon="help-circle-outline"
            title="Trợ giúp và hỗ trợ"
            onPress={() => {
              // TODO: Navigate to help
            }}
          />
          <Divider />
          <ListItem
            leftIcon="information-circle-outline"
            title="Giới thiệu"
            onPress={() => {
              // TODO: Navigate to about
            }}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
