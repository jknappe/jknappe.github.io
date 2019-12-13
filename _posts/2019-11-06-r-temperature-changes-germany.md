---
layout: post
title: "Temperature changes in Germany visualized in R"
image:
  teaser : /images/blog/r-temperature-changes-germany-teaser.jpg
tags: [R, Climate Change, Data Science, Visualization, tidyverse]
comments: true
excerpt_separator: <!--more-->
---

Recently ZEIT online, a leading German online newspaper, published an article on long-term changes in temperature throughout the country based on publicly available data. The article included some very striking and informative visualization that I wanted to recreate using R and the tidyverse.

<!--more-->

On December 10, 2019, the Germany news website [ZEIT Online](https://www.zeit.de/) published an article entitled [Klimawandel: Viel zu warm hier](https://www.zeit.de/wissen/umwelt/2019-12/klimawandel-globale-erwaermung-warming-stripes-wohnort) (*Climate Change: Much too warm here*) which included a striking visualization of how annual mean temperatures changed over the past >100 years in Germany by region.

![temperature changes in Germany](/images/blog/r-temperature-changes-germany-zeit-onlie-screenshot.jpg "temperature changes in Germany")

The data for this visualization came from the German Meteorological Service ([Deutscher Wetterdienst DWD]((https://www.dwd.de/EN/Home/home_node.html))) which is [openly publishing data on the average temperature](https://opendata.dwd.de/climate_environment/CDC/grids_germany/annual/air_temperature_mean/) (or to more precise, on the annual mean of the monthly averaged mean daily air temperature) for Germany based on a 1 km by 1 km grid. The data reaches all the way back to 1881 and is stored in compressed [ESRI ASCII grid format](https://en.wikipedia.org/wiki/Esri_grid). In the ESRI grid, each cell is referenced by its x and y coordinate and a variable containing the temperature value in 1/10th of a degree Celsius, e.g. 12.3°C will be coded as '123'.

To read the data into R, we can make use of the [*SDMTools* package](https://cran.r-project.org/web/packages/SDMTools/index.html). *SDMTools* was mainly developed to do [species distribution modelling](https://en.wikipedia.org/wiki/Species_distribution_modelling) (SDM) but also includes the handy `read.asc.gz()` function that let's us read compressed ESRI ASCII grid files (which we have here).

So, let's load this package and also the [tidyverse](https://www.tidyverse.org/).

```
## uncomment the line below to install the package
# install.packages("SDMTools")

library(SDMTools)
library(tidyverse)
```

 After downloading the data files and storing them in a folder called `/data`, we can now use the `read.asc.gz()` function to import the data. But instead of loading all the 138 data files at once, it might be a good idea to start with a single file to check whether the function works as expected and what the output of the function is. So, let's randomly pick the year 2000.
 
```
temperature_2000 = 
    read.asc.gz(file = "data/grids_germany_annual_air_temp_mean_200017.asc.gz")
                
str(temperature_2000)
``` 

```{output}
 'asc' num [1:654, 1:866] NA NA NA NA NA NA NA NA NA NA ...
 - attr(*, "xll")= num 3280915
 - attr(*, "yll")= num 5238001
 - attr(*, "cellsize")= num 1000
 - attr(*, "type")= chr "numeric"
```

So, the function returns a raster matrix of the class 'asc'. By checking the [documentation for `read.asc.gz()`](https://www.rforge.net/doc/packages/SDMTools/read.asc.html) we find that the four attributes stand for the following:

- `xll` is the x coordinate of the center of the lower left pixel of the map
- `yll` is the y coordinate of the center of the lower left pixel of the map
- `cellsize` is the size of a pixel on the studied map
- `type` is either 'numeric' or 'factor'

Unfortunately, this is not yet in *tidy* format which we want for plotting with *ggplot2* later. After a bit of googling around, I found the [*adehabitatMA* package](https://cran.r-project.org/web/packages/adehabitatMA/index.html) which provides tools for the analysis of mapped data and will convert the 'asc' format into a 'SpatialPixelsDataFrame' format using the `asc2spixdf()`function. 

```
## uncomment the line below to install the package
# install.packages("adehabitatMA")

library(adehabitatMA)

temperature_2000 = 
    read.asc.gz(file = "data/grids_germany_annual_air_temp_mean_200017.asc.gz") %>%
	asc2spixdf()

str(temperature_2000)
```

```{output}
Formal class 'SpatialPixelsDataFrame' [package "sp"] with 7 slots
  ..@ data       :'data.frame':	358303 obs. of  1 variable:
  .. ..$ var: num [1:358303] 22 34 14 14 26 49 41 32 12 10 ...
  ..@ coords.nrs : num(0) 
  ..@ grid       :Formal class 'GridTopology' [package "sp"] with 3 slots
  .. .. ..@ cellcentre.offset: Named num [1:2] 3280915 5238001
  .. .. .. ..- attr(*, "names")= chr [1:2] "x" "y"
  .. .. ..@ cellsize         : Named num [1:2] 1000 1000
  .. .. .. ..- attr(*, "names")= chr [1:2] "x" "y"
  .. .. ..@ cells.dim        : Named int [1:2] 640 866
  .. .. .. ..- attr(*, "names")= chr [1:2] "x" "y"
  ..@ grid.index : int [1:358303] 553909 553910 553913 ...
  ..@ coords     : num [1:358303, 1:2] 3588915 3589915 ...
  .. ..- attr(*, "dimnames")=List of 2
  .. .. ..$ : chr [1:358303] "309" "310" "313" "963" ...
  .. .. ..$ : chr [1:2] "x" "y"
  ..@ bbox       : num [1:2, 1:2] 3280415 5237501 3920415 6103501
  .. ..- attr(*, "dimnames")=List of 2
  .. .. ..$ : chr [1:2] "x" "y"
  .. .. ..$ : chr [1:2] "min" "max"
  ..@ proj4string:Formal class 'CRS' [package "sp"] with 1 slot
  .. .. ..@ projargs: chr NA
```

Still not a *tidy* format but we can use the [*raster* package](https://cran.r-project.org/web/packages/raster/index.html) to extract the information *ggplot2* expects from us (Thanks to Andrew Tredennick of Colorado State University to [point this out](https://www.nrel.colostate.edu/this-is-how-i-did-it-mapping-in-r-with-ggplot2/)). There might be an overall more elegant and straight forward way than using these three packages in sequence; and if you know of one, please do let me know. But for now, that seems to work quite well as we can see below.

```
## uncomment the line below to install the package
# install.packages("raster")

library(raster)

map = raster(x = temperature_2000)
map.p = rasterToPoints(map)
df = data.frame(map.p)
colnames(df) = c("Longitude", "Latitude", "Temperature")


ggplot(data=df, aes(y = Latitude, x = Longitude)) +
    geom_raster(aes(fill = MAP)) +
    coord_equal() 
```

![First try using the raster package](/images/blog/r-temperature-changes-germany-2000-first.jpg "First try using the raster package")

This looks very promising. We can tidy up the code a bit, include the entire pipeline (so far) and adjust the plot. E.g. we still need to convert the temperature scale (remember, that the data was reported as 1/10th of a degree) and remove the x- and y-axis as the coordinates are not really of interest here.

```
temperature_2000 = 
    read.asc.gz(file = "data/grids_germany_annual_air_temp_mean_200017.asc.gz") %>%
    raster() %>%
    rasterToPoints() %>% 
    data.frame() %>%
    transmute(longitude = x,
              latitude = y,
              temperature = layer/10)

summary(temperature_2000)
```

```{output}
   longitude          latitude        temperature    
 Min.   :3280915   Min.   :5238001   Min.   :-3.300  
 1st Qu.:3480915   1st Qu.:5485001   1st Qu.: 9.400  
 Median :3594915   Median :5670001   Median :10.000  
 Mean   :3596179   Mean   :5657995   Mean   : 9.874  
 3rd Qu.:3714915   3rd Qu.:5826001   3rd Qu.:10.500  
 Max.   :3919915   Max.   :6103001   Max.   :12.900  
```

This is a very nice, tidy format we can plot.

```
ggplot(data = temperature_2000) +
    geom_raster(aes(x = longitude,
                    y = latitude,
                    fill = temperature)) +
    theme_void() +
    coord_equal() +
    labs(fill = "Annual mean temperature") +
    theme(legend.position = "bottom")
```

![Second try using the raster package](/images/blog/r-temperature-changes-germany-2000-second.jpg "Second try using the raster package")

That looks very good already. Now we can be confident in importing the rest of the data. To do that we can slightly tweak the pipeline, so that it iterates over all the files in the `/data` folder. For that, we can use `list.files()` with the recursive option turned on to get a list of all the data files that match a specific pattern (in our case this would be 'grids_germany_annual_air_temp_mean' and then pass this list on to `lappy()` which contains the pipe that we used before. At last, we combine all the data files into a single data frame using `bind_rows()` and an ID variable we call `year` that will keep track of the year of the data.

```
temperature_all = 
    list.files(pattern = "grids_germany_annual_air_temp_mean", recursive = TRUE) %>%
    lapply(function(x) read.asc.gz(x) %>%
               raster() %>%
               rasterToPoints() %>% 
               data.frame()) %>%
    bind_rows(.id = "year") %>%
    transmute(year = as.numeric(year) + 1880,
              longitude = x,
              latitude = y,
              temperature = layer/10)

summary(temperature_all)
```

```{output}
      year        longitude          latitude        temperature    
 Min.   :1881   Min.   :3280915   Min.   :5238001   Min.   :-5.600  
 1st Qu.:1915   1st Qu.:3480915   1st Qu.:5485001   1st Qu.: 7.600  
 Median :1950   Median :3594915   Median :5670001   Median : 8.400  
 Mean   :1950   Mean   :3596179   Mean   :5657995   Mean   : 8.369  
 3rd Qu.:1984   3rd Qu.:3714915   3rd Qu.:5826001   3rd Qu.: 9.200  
 Max.   :2018   Max.   :3919915   Max.   :6103001   Max.   :13.400  
```

But we are still not quite finished. The plot in the Zeit Online article did not depict the mean annual temperature, but the deviation from a reference temperature. They used a method adopted from the [warming stripes developed by Ed Hawkins](https://showyourstripes.info/), a climate scientist at the University of Reading) to define the reference temperature period. Interestingly, ZEIT Online used a reference period of 1961 to 1990 while Ed Hawkins uses the years 1971 to 2000 for the same. Let's stick with the latter here, as I feel we should stay close to the original. Also, checking the [documentation on the warming stripes](https://showyourstripes.info/faq), I discovered that color there codes not for the actual absolute deviation from the reference temperature, but is rather expressed as a relative deviations with a cap at ± 2.6 standard deviations (SDs). This is interesting, as we will see below, because we actually have quite a wider range of deviations in the data. But let's first calculate the reference period mean temperature for each location and then, calculate the absolute and relative deviations.

First, the reference temperature.

```
reference_temperature = 
    temperature_all %>%
    filter(year >= 1971 & year <= 2000) %>%
    group_by(longitude, latitude) %>%
    summarise(reference_temperature = mean(temperature, na.rm = TRUE),
              reference_sd = sd(temperature, na.rm = TRUE)) %>%
    ungroup()

summary(reference_temperature$reference_temperature)
```

```{output}
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
 0.5265  0.7182  0.7650  0.7619  0.8157  1.0918
```

And now, the deviations (expressed in SDs) from the reference.

```
deviation_temperature = 
    temperature_all %>%
    left_join(reference_temperature,
              by = c("longitude", "latitude")) %>%
    mutate(deviation_mean = temperature - reference_temperature,
           deviation_sd = deviation_mean/reference_sd)
		   
summary(deviation_temperature$deviation_sd)
```

```{output}
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max. 
-4.7705 -1.0606 -0.2601 -0.2548  0.5051  7.2021 
```  

As we see, while most of the deviations are close enough, we have strong outliers both above and below the reference temperature. However, they will be reduced in the plot to ± 2.6 SDs. I suppose, this improves the overall visualization as it narrows (and standardizes) the ranges, which might come in very handy when comparing a variety of countries.

Well, after all this, we now finally have all the data we need. To plot this as nicely as in the ZEIT Online article, we can now use `facet_wrap()` separate the data by year. As we are parsing nearly 50 million data point at this point, plotting this might a short while, depending on your machine.

```
ggplot(deviation_temperature) +
    geom_raster(aes(x = longitude,
                    y = latitude,
                    fill = deviation_sd)) +
    facet_wrap(~ year,
               nrow = 7) +
    scale_fill_gradient2(low = "#176fb6",
                         mid = "#dfecf7",
                         high = "#cc1017",
                         limits = c(-2.6, 2.6),
                         oob = squish) +
    theme_void() +
    coord_equal() +
    theme(legend.position = "none",
          strip.background = element_blank(),
          strip.text.x = element_blank())
```

![Final grid](/images/blog/r-temperature-changes-germany-grid.jpg "Final grid")

And that would be it, voila! 

Well, technically not quite since ZEIT Online was binning the data by local councils while we are still using the original 1 km grid. But since I don't have this available at the moment, we'll leave it at that.

Ok, one last thing we can do is creating the actual warming stripe for the entire country of Germany and compare it to the global warming stripe we find on the [warming stripe website](https://showyourstripes.info/), copied here below:

![global warming stripe](/images/blog/r-temperature-changes-germany-global-warming-stripe.jpg "global warming stripe")

Let's create that stripe for Germany by grouping by year and calculating the mean deviation across the entire country.

```
germany_warming_stripe = 
    deviation_temperature %>%
    group_by(year) %>%
    summarise(germany_sd = mean(deviation_sd, na.rm = TRUE)) %>%
    ungroup() %>%
    mutate(dummy = 1)

summary(germany_warming_stripe)
```

```{output
      year        germany_sd          dummy  
 Min.   :1881   Min.   :-2.4810   Min.   :1  
 1st Qu.:1915   1st Qu.:-1.0761   1st Qu.:1  
 Median :1950   Median :-0.2128   Median :1  
 Mean   :1950   Mean   :-0.2548   Mean   :1  
 3rd Qu.:1984   3rd Qu.: 0.4732   3rd Qu.:1  
 Max.   :2018   Max.   : 2.5081   Max.   :1  
```

```
ggplot(data = germany_warming_stripe) + 
    geom_col(aes(x = year,
                 y = dummy,
                 fill = germany_sd),
             width = 1) +
    scale_fill_gradient2(low = "#176fb6",
                         mid = "#dfecf7",
                         high = "#cc1017",
                         limits = c(-2.6, 2.6),
                         oob = squish) +
    theme_void() +
    theme(legend.position = "none")
```

![germany warming stripe](/images/blog/r-temperature-changes-germany-germany-warming-stripe.jpg "germany warming stripe")

By the way, you can find all the (non-R) code Zeit Online used in their [GitHub project](https://github.com/ZeitOnline/waermestreifen-gemeinden-scripts), how cool is that?















