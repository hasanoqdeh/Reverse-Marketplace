import {Platform} from 'react-native';
import Config from 'react-native-config';

/**
 * Centralized runtime configuration.
 *
 * Values come from `react-native-config` (a build-time `.env` file). When no
 * `.env` value is present — e.g. a fresh checkout, a test run, or an emulator
 * build that hasn't been rebuilt natively — we fall back to platform-aware
 * localhost defaults so the local dev flow keeps working with zero setup.
 *
 * For staging / production / physical-device testing, set `API_URL` in `.env`
 * (see `.env.example`). This is the single source of truth for the server URL.
 */

const DEFAULT_SERVER_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000' // Android emulator -> host loopback
    : 'http://localhost:3000'; // iOS simulator

export const SERVER_URL: string = Config.API_URL || DEFAULT_SERVER_URL;

export const API_BASE_URL = `${SERVER_URL}/api/v1`;
