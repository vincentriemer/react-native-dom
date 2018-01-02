#pragma once

#include "../yoga/Yoga.h"

class Config {

    friend class Node;

 public:

    static Config * create(void);

    static void destroy(Config * config);

 private:

    Config(void);

 public:

    ~Config(void);

 public: // Prevent accidental copy

    Config(Config const &) = delete;

    Config const & operator=(Config const &) = delete;

 public: // Setters

    void setExperimentalFeatureEnabled(int feature, bool enabled);
    void setPointScaleFactor(float pixelsInPoint);
 
 public: // Getters

    bool isExperimentalFeatureEnabled(int feature) const;

 private:

    YGConfigRef m_config;

};