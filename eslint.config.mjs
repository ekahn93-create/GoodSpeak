import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script", // vanilla JS, not ES modules
      globals: {
        ...globals.browser,  // window, document, fetch, etc.
        ...globals.node,     // for netlify functions
        // Project globals — each file both defines and consumes these across script tags
        APIService: "writable",
        App: "writable",
        AppConfig: "writable",
        AuthModule: "writable",
        DailyWordModule: "writable",
        DeepgramSTT: "writable",
        FluencyModule: "writable",
        GrammarModule: "writable",
        MWWordOfDayModule: "writable",
        Modal: "writable",
        NudgeModule: "writable",
        OnboardingModule: "writable",
        PlayModule: "writable",
        ProfileModule: "writable",
        ProgressChartsModule: "writable",
        ReadAloudModule: "writable",
        RecordingsModule: "writable",
        Router: "writable",
        SRSModule: "writable",
        SessionWords: "writable",
        ShadowingModule: "writable",
        StorytellingModule: "writable",
        SyncModule: "writable",
        TTSHelper: "writable",
        ToastManager: "writable",
        VocabularyModule: "writable",
        WebSpeechModule: "writable",
        WordBankModule: "writable",
        // Data globals
        dailyWordsDatabase: "writable",
        getPromptById: "writable",
        getPromptsByTheme: "writable",
        getTodaysWord: "writable",
        getTodaysWordOfTheDay: "writable",
        speakingPrompts: "writable",
        storyPromptsDatabase: "writable",
        vocabularyDatabase: "writable",
        wordTopics: "writable",
        // Constants
        DIFFICULTY_TIME: "readonly",
        MIN_WORD_LENGTH: "readonly",
        POOL_MAX_SIZE: "readonly",
        POOL_REFILL_THRESHOLD: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-redeclare": "off", // modules intentionally redeclare their own global var
      "no-console": "off",
      "semi": ["warn", "always"],
      "eqeqeq": ["warn", "always"],
    },
  },
  {
    ignores: ["node_modules/", "test-results/"],
  },
];
