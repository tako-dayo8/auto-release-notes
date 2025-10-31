/**
 * Unit tests for logger utilities
 */

import * as core from '@actions/core';
import {
  LogLevel,
  setLogLevel,
  isDebugEnabled,
  debug,
  info,
  warning,
  error,
  success,
  startGroup,
  endGroup,
  progress,
  section,
  Timer,
  debugObject,
  validation,
} from '../../src/logger';

// Mock @actions/core
jest.mock('@actions/core');

describe('setLogLevel', () => {
  test('sets the log level', () => {
    setLogLevel(LogLevel.DEBUG);
    expect(isDebugEnabled()).toBe(true);

    setLogLevel(LogLevel.ERROR);
    expect(isDebugEnabled()).toBe(false);
  });
});

describe('isDebugEnabled', () => {
  const originalEnv = process.env.ACTIONS_STEP_DEBUG;

  afterEach(() => {
    process.env.ACTIONS_STEP_DEBUG = originalEnv;
    setLogLevel(LogLevel.INFO);
  });

  test('returns true when ACTIONS_STEP_DEBUG is true', () => {
    process.env.ACTIONS_STEP_DEBUG = 'true';
    expect(isDebugEnabled()).toBe(true);
  });

  test('returns false when ACTIONS_STEP_DEBUG is not set', () => {
    delete process.env.ACTIONS_STEP_DEBUG;
    setLogLevel(LogLevel.INFO);
    expect(isDebugEnabled()).toBe(false);
  });

  test('returns true when log level is DEBUG', () => {
    delete process.env.ACTIONS_STEP_DEBUG;
    setLogLevel(LogLevel.DEBUG);
    expect(isDebugEnabled()).toBe(true);
  });
});

describe('debug', () => {
  const mockedDebug = core.debug as jest.MockedFunction<typeof core.debug>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    setLogLevel(LogLevel.INFO);
  });

  test('logs debug message when debug is enabled', () => {
    debug('test message');
    expect(mockedDebug).toHaveBeenCalledWith('test message');
  });

  test('logs debug message with arguments', () => {
    debug('test', { key: 'value' });
    // args are passed as an array, so JSON.stringify wraps them in []
    expect(mockedDebug).toHaveBeenCalledWith('test [{"key":"value"}]');
  });

  test('does not log when debug is disabled', () => {
    setLogLevel(LogLevel.INFO);
    debug('test message');
    expect(mockedDebug).not.toHaveBeenCalled();
  });
});

describe('info', () => {
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs info message', () => {
    info('test message');
    expect(mockedInfo).toHaveBeenCalledWith('test message');
  });

  test('does not log when log level is higher', () => {
    setLogLevel(LogLevel.ERROR);
    info('test message');
    expect(mockedInfo).not.toHaveBeenCalled();
  });
});

describe('warning', () => {
  const mockedWarning = core.warning as jest.MockedFunction<typeof core.warning>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs warning message', () => {
    warning('test warning');
    expect(mockedWarning).toHaveBeenCalledWith('test warning');
  });

  test('does not log when log level is ERROR', () => {
    setLogLevel(LogLevel.ERROR);
    warning('test warning');
    expect(mockedWarning).not.toHaveBeenCalled();
  });
});

describe('error', () => {
  const mockedError = core.error as jest.MockedFunction<typeof core.error>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('logs error message', () => {
    error('test error');
    expect(mockedError).toHaveBeenCalledWith('test error');
  });

  test('always logs regardless of log level', () => {
    setLogLevel(LogLevel.ERROR);
    error('test error');
    expect(mockedError).toHaveBeenCalled();
  });
});

describe('success', () => {
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs success message with checkmark', () => {
    success('operation successful');
    expect(mockedInfo).toHaveBeenCalledWith('✓ operation successful');
  });
});

describe('startGroup and endGroup', () => {
  const mockedStartGroup = core.startGroup as jest.MockedFunction<typeof core.startGroup>;
  const mockedEndGroup = core.endGroup as jest.MockedFunction<typeof core.endGroup>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('starts a log group', () => {
    startGroup('test group');
    expect(mockedStartGroup).toHaveBeenCalledWith('test group');
  });

  test('ends a log group', () => {
    endGroup();
    expect(mockedEndGroup).toHaveBeenCalled();
  });
});

describe('progress', () => {
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs progress with indicator', () => {
    progress(3, 10, 'processing items');
    expect(mockedInfo).toHaveBeenCalledWith('[3/10] processing items');
  });
});

describe('section', () => {
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs section header', () => {
    section('Test Section');

    // Should call info multiple times for the section format
    expect(mockedInfo).toHaveBeenCalled();
    expect(mockedInfo).toHaveBeenCalledWith('  Test Section');
  });
});

describe('Timer', () => {
  const mockedDebug = core.debug as jest.MockedFunction<typeof core.debug>;
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    jest.useRealTimers();
    setLogLevel(LogLevel.INFO);
  });

  test('creates timer and logs start', () => {
    new Timer('test operation');
    expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('Timer started: test operation'));
  });

  test('ends timer and logs duration in debug', () => {
    const timer = new Timer('test operation');
    jest.clearAllMocks();

    jest.advanceTimersByTime(1000);
    timer.end();

    expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('Timer ended: test operation'));
    expect(mockedDebug).toHaveBeenCalledWith(expect.stringContaining('1000ms'));
  });

  test('ends timer with info log', () => {
    const timer = new Timer('test operation');
    jest.clearAllMocks();

    jest.advanceTimersByTime(500);
    timer.endWithLog();

    expect(mockedInfo).toHaveBeenCalledWith(expect.stringContaining('test operation'));
    expect(mockedInfo).toHaveBeenCalledWith(expect.stringContaining('500ms'));
  });
});

describe('debugObject', () => {
  const mockedDebug = core.debug as jest.MockedFunction<typeof core.debug>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.DEBUG);
  });

  afterEach(() => {
    setLogLevel(LogLevel.INFO);
  });

  test('logs object in debug mode', () => {
    const obj = { key: 'value', num: 123 };
    debugObject('test object', obj);

    expect(mockedDebug).toHaveBeenCalled();
  });

  test('does not log when debug is disabled', () => {
    setLogLevel(LogLevel.INFO);
    const obj = { key: 'value' };
    debugObject('test object', obj);

    expect(mockedDebug).not.toHaveBeenCalled();
  });
});

describe('validation', () => {
  const mockedInfo = core.info as jest.MockedFunction<typeof core.info>;
  const mockedError = core.error as jest.MockedFunction<typeof core.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    setLogLevel(LogLevel.INFO);
  });

  test('logs success validation with checkmark', () => {
    validation(true, 'validation passed');
    expect(mockedInfo).toHaveBeenCalledWith('✓ validation passed');
  });

  test('logs failed validation with X', () => {
    validation(false, 'validation failed');
    expect(mockedError).toHaveBeenCalledWith('✗ validation failed');
  });
});
