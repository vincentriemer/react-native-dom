#pragma once

struct Size
{
    double width;
    double height;

    Size(void)
    : width(0.0)
    , height(0.0)
    {
    }

    Size(double width, double height)
    : width(width)
    , height(height)
    {
    }
};