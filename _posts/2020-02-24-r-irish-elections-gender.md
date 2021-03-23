---
layout: post
title: "Gender balance in the Irish elections a.k.a. an excellent excuse to learn how to create stacked point plots and butterfly plots in R!"
image:
  teaser : /images/blog/r-irish-elections-butterfly-plot-teaser.jpg
tags: [R, Ireland, Data Science, Visualization, tidyverse]
comments: true
excerpt_separator: <!--more-->
---

With the most recent Irish General Election having concluded last month, I got interested in looking at some of the available data and trying to see how they could be visualized with R. Here, we’ll have a look on how to use stacked dot plots and butterfly plots to show gender balance among running and elected candidates by party and constituency.

<!--more-->

Ireland elected a new parliament just earlier this month. Ever since moving to Dublin in 2014, this was my second General Election. As a non-Irish citizen, I cannot vote in this election, but I am entitled to crunch the numbers afterwards at least... As every country has a slightly different voting system, Ireland is no exception here. On the contrary, Ireland uses a [single transferable vote (STV) system](https://en.wikipedia.org/wiki/Single_transferable_vote), whereby a voter can rank candidates in order of preference. This seems to me like a quite reasonable thing, as this system ensures that the vast majority of votes will actually count, even if the first preference candidate is not elected. So naturally, this STV system results in a large number of re-counts as votes get distributed from count to count. I am planning to write a small R package to simulate the system in the future (so stay tuned) but will focus on something else in this post, namely the gender distribution among running and elected candidates for each party and constituency.

So this is where we wanna get to:
![feature](/images/blog/r-irish-elections-gender-feature.png "feature")


The only thing we really need to know at this stage about the STV voting system is that there are a few quirks when looking at Irish election results (I am going to use the data from 2016 as this is the most recent election for which the [complete data has been published in a full report](https://data.oireachtas.ie/ie/oireachtas/electoralProcess/electionResults/dail/2016/2016-04-28_32nd-dail-general-election-results_en.pdf)):

- In 2016 Ireland had 40 constituencies and elected a total of 157 out of 394 candidates into perliament (so right off the start, there is a 40% chance you get elected when you stand - not too bad at all, I'd say).
- Every constituency sends between 3 and 5 candidates into parliament
- A party can run more than one candidate in each constituency in hope to gain more than one seat from that constituency

In the [final election results report of 2016](https://data.oireachtas.ie/ie/oireachtas/electoralProcess/electionResults/dail/2016/2016-04-28_32nd-dail-general-election-results_en.pdf) there are overview tables on gender distribution in the appendix. I copied the data into a CSV file and cleaned them up a bit; you can [download the CSV file here](/assets/data/irish_election_results_2016.csv) if you want to follow along. The data is structured as follows:

```{output}
'data.frame':	40 obs. of  65 variables:
 $ constituency        : Factor w/ 40 levels "Carlow-Kilkenny  ",...
 $ female_candidates_fg: int  0 1 1 0 1 1 0 0 0 1 ...
 $ female_elected_fg   : int  0 1 0 0 0 0 0 0 0 0 ...
 $ male_candidates_fg  : int  3 1 2 3 1 1 2 2 2 2 ...
 $ male_elected_fg     : int  2 0 2 1 1 1 1 1 1 1 ...
 .
 .
 .
 $ female_candidates_in: int  0 1 1 1 0 1 1 2 1 1 ...
 $ female_elected_in   : int  0 0 0 0 0 0 0 0 0 0 ...
 $ male_candidates_in  : int  3 4 5 3 4 4 4 2 6 5 ...
 $ male_elected_in     : int  0 0 1 0 0 0 0 1 1 1 ...
```

There are 40 rows (one for each constituency) and 65 columns containing the data. Apart from the `constituency` column, the column names follow the pattern of *gender_status_party* with *gender* being either `female` or `male`, *status* being either `elected` or `not elected`, and *party* being a two-character coding for the political party (we'll get into that later). The data is in wide format and we will need to clean that up a bit before working with it, so let's get to it.

First, we load the [tidyverse](https://www.tidyverse.org/) suite of packages that gives us everything we need for reading, transforming, and visualizing the data.

```
library(tidyverse)
```

Now, we can load the data from the CSV file into R.

```
results_2016 =
    # read in the data from the CSV file
    read_csv(file = "irish_election_results_2016.csv",
             col_types = cols(.default = col_integer(),
                              constituency = col_character())) %>%
    # convert to long format
    gather(key = category, value = count, -constituency) %>%
    # separate columns coding for multiple variables
    separate(category, into = c("status", "gender", "party")) %>%
    # determine number of elected/non elected condidates by gender
    unite(col = "status_gender", status, gender, sep = "_") %>%
    spread(key = status_gender, value = count) %>%
    mutate(female_notelected = female_candidates - female_elected,
           male_notelected = male_candidates - male_elected) %>%
    select(constituency, party, female_elected, female_notelected, male_elected, male_notelected) %>%
    gather(key = category, value = count, -constituency, -party) %>%
    separate(category, into = c("gender", "status")) %>%
    mutate_if(is.character, factor)
```

There are a few things going on here. After reading in the data, we convert the wide to long format using the `gather()` function. I know that I should probably switch to the newer (and futureproof) `pivot_longer()` function for that, but gather/spread work for me. This is probably more a matter of habit at this point, than active resistance to change. Bear with me, please. We then split the new column into three columns for *gender*, *status* and *party* as mentioned above. Lastly, we calculate the number of elected and non-elected candidates per gender, party, and constituency (so far we only have the total number of candudates that ran and the number of elected candidates). This steps needs a bit of wiggeling back and forth between long and wide format and I am sure there is a more elegant way of achieving this than what I did here. So, if you know of one, [get in touch with me](/about). In the end, our cleaned and tidied data frame looks like this:

```
str(results_2016)
```

```{output
Classes ‘tbl_df’, ‘tbl’ and 'data.frame':	2560 obs. of  5 variables:
 $ constituency: Factor w/ 40 levels "Carlow-Kilkenny",..
 $ party       : Factor w/ 16 levels "4c","aa","cd",..
 $ gender      : Factor w/ 2 levels "female","male"
 $ status      : Factor w/ 2 levels "elected","notelected"
 $ count       : int  0 0 0 0 0 0 0 0 0 0 ...
```

We now have a tidy data frame with a column for *constituency*, *party*, *gender*, *status*, and *count* (the number of candidates). So, let's get [in medias res](https://en.wikipedia.org/wiki/In_medias_res).

### Overall gender distribution

Let's first look into the general gender distribution. A quick first bar plot reveals that slightly more than two-thirds of elected candidates are male while the fraction of non-elected candidates has relatively more women, which means that female candidates were less likely to be elected into parliament as compared to male candidates.

```
ggplot(results_2016) +
    geom_bar(aes(x = status,
                 y = count,
                 color = gender,
                 fill = gender),
             position = "fill", 
             stat = "identity") +
    scale_y_continuous(labels = scales::percent_format())
```

![bar plot](/images/blog/r-irish-elections-gender-overall-bar.png "bar plot")

I'd like to make this a bit nicer with each individual candidate being represents as a dot in a grid (People are people!). For that, we can use `geom_point()` if we assign individual candidates an arbitrary position in a xy grid that we plot. We can, then facet by gender and then color by whether or not a candidate got elected or not. Basically, something like that:

![sketch](/images/blog/r-irish-elections-gender-overall-sketch.png "sketch")

So, let's use the modulo and remainder to create the x and y coordinate for the grid for each candidate. Before we do that, however, we need to uncount the `count` column (unfortunate naming of the column here on my side), so that each gender-status combination has `count` number of non-unique rows (thanks to [Nate for pointing that out on Stackoverflow](https://stackoverflow.com/questions/53697235/ggplot-dotplot-what-is-the-proper-use-of-geom-dotplot)). Lastly, we'll add some auxiliary columns for labeling the plot nicely. You'll see what I mean when we look at the data frame before and after reshaping.

```
results_2016_overall =
    # load data
    results_2016 %>%
    select(gender, status, count) %>%
    # for a clustered geom point we need to "uncount" our numerical variable
    # and then assign an x and y grid position for each candidate
    uncount(count) %>%
    group_by(gender) %>%
    mutate(count = sequence(n()) - 1) %>%
    ungroup() %>%
    mutate(x = count %% 15,
           y = count %/% 15) %>%
    select(-count) %>%
    # add labels for plot
    mutate(status_label = case_when(status == "elected" ~ "elected",
                                    status == "notelected" ~ "not elected"),
           gender_label = case_when(gender == "female" ~ "Female candidates",
                                    gender == "male" ~ "Male candidates")) %>%
    mutate_if(is.character, factor)

str(results_2016_overall)
```

```{output}
Classes ‘tbl_df’, ‘tbl’ and 'data.frame':	551 obs. of  6 variables:
 $ gender      : Factor w/ 2 levels "female","male"
 $ status      : Factor w/ 2 levels "elected","notelected"
 $ x           : num  0 1 2 3 4 5 6 7 8 9 ...
 $ y           : num  0 0 0 0 0 0 0 0 0 0 ...
 $ status_label: Factor w/ 2 levels "elected","not elected"
 $ gender_label: Factor w/ 2 levels "Female candidates",..
```

With this, we can now create a nicer looking plot similar to what I had in mind at the start. We use faceting to get a side-by-side comparison for both genders. We can get rid off all the axes labels as they do not really make sense in this context.

```
ggplot(results_2016_overall) +
    geom_point(aes(x = x, 
                   y = y, 
                   color = status_label),
               shape = 19,
               size = 4) +
    facet_wrap(~ gender_label, strip.position = "bottom") +
    scale_color_manual(name = NULL, 
                       values = c("palegreen3", "grey87")) +
    scale_x_continuous(name = NULL, breaks = NULL) +
    scale_y_continuous(name = NULL, breaks = NULL) +
    ggtitle("Irish general election 2016: Distribution of female and male candidates") +
    theme_minimal() +
    theme(panel.grid = element_blank(),
          legend.position = "top",
          strip.text = element_text(size = 12, face = "bold"),
          plot.title = element_text(hjust = 0.5),
          legend.text = element_text(size = 10, face = "bold"))
```

Which gives us this plot.
 
![point plot](/images/blog/r-irish-elections-gender-overall-point.png "point plot")

We clearly see that across all parties and constituencies the total number of women that ran for office in 2016 was less than half of the number of male candidates. And looking at the number of elected candidates, we see that the total number of women is less than a third of the number of elected men. Well, so much about overall gender balance. But let's look at the distribution by constituency now.

### Gender balance by constituency

So, this time I wanted to get a sort of faceted butterfly plot with individual dots for each candidate and color coding for elected/non elected candidates (potentially also color coding for majority-male/majority-female constituencies). Something similar to that:

![sketch](/images/blog/r-irish-elections-gender-constituency-sketch.png "sketch")

Let's try a quick and dirty flipped column plot.

```
results_2016_constituency =
    results_2016 %>%
    group_by(constituency, gender, status) %>%
    summarise(count = sum(count)) %>%
    ungroup() 

ggplot(results_2016_constituency) +
    geom_col(aes(x = constituency,
                 y = count,
                 fill = status)) +
    facet_wrap(~gender) +
    coord_flip()
```

![col](/images/blog/r-irish-elections-gender-constituency-col.png "col")

This looks promising but we I'd like to convert the bars to points, have the constituency labels in the middle, and color code for majority-male/majority-female constituencies. 

#### Convert the bar plot to stacked points

We learned earlier that we can use the `uncount()` and `geom_point()` hack to get a two-dimensional raster of data points. We can try the same now to convert the bars to points, but limit it to one dimension as we won't have too many data points now in each category. Let's see how that goes.

```
results_2016_constituency =
    results_2016 %>%
    group_by(constituency, gender, status) %>%
    summarise(count = sum(count)) %>%
    ungroup() %>%
    uncount(count) %>%
    group_by(constituency, gender) %>%
    mutate(y = sequence(n())) %>%
    ungroup() 
	
ggplot(results_2016_constituency) +
    geom_point(aes(x = constituency,
                   y = y,
                   color = status),
               shape = 19,
               size = 4) +
    facet_wrap(~gender) +
    coord_flip()
```

![points](/images/blog/r-irish-elections-gender-constituency-points.png "points")

Better. We now are left with moving the constituency labels into the middle and color coding for majority male/female constituencies.

#### Butterfly plot using the `ggpol` package

With a bit of search on how to have a butterfly plot with the categorical axis in the middle, I stumbled upon the [`ggpol` package](https://friendly-lamport-9a7964.netlify.com/project/ggpol/) by [Frederik Tiedemann](https://friendly-lamport-9a7964.netlify.com/). Specifically, the `ggplot` extension function `facet_share()` within the package allows us exactly to do that. The [package vignette](https://erocoar.github.io/ggpol/) says: 

> `facet_share()` is an experimental feature that implements basic shared axes for `facet_wrap()` with only two panels (i.e., this will not work if you stratify by a variable with more than 2 levels). If we want to mirror our axis, we will have to multiply one panel by -1 (the choice of which panel to multiply by -1 is natural, i.e. the left one for horizontal, and the bottom one for vertical directions). Since this will also change the axis labels for that panel, setting `reverse_num` to TRUE will reverse this change. The horizontal mirroring also requires using `coord_flip()`.

Coolio, let's try that.

```
ggplot(results_2016_constituency) +
    geom_point(aes(x = constituency,
                   y = y,
                   color = status),
               shape = 19,
               size = 4) +
    facet_share(~ gender, 
                dir = "h") +
    coord_flip() 
```

![facetshare1](/images/blog/r-irish-elections-gender-constituency-facetshare1.png "facetshare1")

That seems to work. To achieve the full ["butterfly effect"](https://en.wikipedia.org/wiki/Butterfly_effect) however, we need to negate the left hand y axis (`status == female` in our case) as mentioned in the vignette above. Note that we also set `scales = "free"` and `reverse_num = TRUE` to get a meaningful axis.

```
results_2016_constituency =
    results_2016 %>%
    group_by(constituency, gender, status) %>%
    summarise(count = sum(count)) %>%
    ungroup() %>%
    # determine gender ration for plot coloring
    unite(col = "status_gender", gender, status, sep = "_") %>%
    spread(key = status_gender, value = count) %>%
    mutate(ratio = female_elected / male_elected) %>%
    gather(key = category, value = count, -constituency, -ratio) %>%
    separate(category, into = c("gender", "status")) %>%
    uncount(count) %>%
    # calculate y position (needs to negative for one gender factor level)
    group_by(constituency, gender) %>%
    mutate(y = sequence(n())) %>%
    mutate(y = ifelse(gender == "female", -y, y)) %>%
    ungroup() 
	
ggplot(results_2016_constituency) +
    geom_point(aes(x = constituency,
                   y = y,
                   color = status),
               shape = 19,
               size = 4) +
    facet_share(~ gender, 
                dir = "h", 
                scales = "free",
                reverse_num = TRUE) +
    coord_flip() 
```

![facetshare2](/images/blog/r-irish-elections-gender-constituency-facetshare2.png "facetshare2")

Nearly there. The y-axis now has and unequal distribution (since the `scales` argument is set to free). This makes the distributions of point along the horizontal axis unequal for both facets. We can fix that by adding a hidden `geom_blank()` to the plot that basically extends the axis limits on both sides to the maximum number of total candidates in a single constituency. We just need to create a small dummy data frame that provides the desired axis limits for this purpose.

```
dummy_constituency = 
    tibble(y = c(-max(results_2016_constituency$y), 0, 0, max(results_2016_constituency$y)),
           gender = c("female", "female", "male", "male")) %>%
    mutate(gender_label = case_when(gender == "female" ~ "Female candidates",
                                    gender == "male" ~ "Male candidates"))
									
dummy_constituency
```

```{output}
# A tibble: 4 x 3
      y gender gender_label     
  <dbl> <chr>  <chr>            
1   -15 female Female candidates
2     0 female Female candidates
3     0 male   Male candidates  
4    15 male   Male candidates  
```

Trying to set limits and breaks directly in ggplot (e.g. through `scale_y_continuous()` didn't work as the female facet has negative y-values and the male facet has positive values (we needed to do this as part of the `facet_share()`). However, the hidden dummy data added to the plot takes care of all this.

```
ggplot() +
    geom_point(data = results_2016_constituency,
               mapping = aes(x = constituency,
                             y = y,
                             color = status),
               shape = 19,
               size = 4) +
    geom_blank(data = dummy_constituency,
               mapping = aes(y = y)) +
    facet_share(~ gender, 
                dir = "h", 
                scales = "free",
                reverse_num = TRUE) +
    coord_flip() 
```
 
![facetshare3](/images/blog/r-irish-elections-gender-constituency-facetshare3.png "facetshare3")


#### Color coding for gender balance and polishing up the plot

Last thing left to do is adding a variable for color coding for gender balance (male/femal majority or gender balance) and polishing up the plot a bit. We'll do that in one go by calculating the female-to-male ratio (using this as color aesthetic instead of *status*), adding a few nice text labels for the plot, removing the y axis and going for a clean, minimal plot theme. Also, I am using the  `fig.width` and `fig.height` arguments in the R Markdown code chunk to space out the size of the figure more evenly (that's not shown here).

```
results_2016_constituency =
    results_2016 %>%
    group_by(constituency, gender, status) %>%
    summarise(count = sum(count)) %>%
    ungroup() %>%
    # determine gender ration for plot coloring
    unite(col = "status_gender", gender, status, sep = "_") %>%
    spread(key = status_gender, value = count) %>%
    mutate(ratio = female_elected / male_elected) %>%
    gather(key = category, value = count, -constituency, -ratio) %>%
    separate(category, into = c("gender", "status")) %>%
    uncount(count) %>%
    # calculate y position (needs to negative for one gender factor level)
    group_by(constituency, gender) %>%
    mutate(y = sequence(n())) %>%
    mutate(y = ifelse(gender == "female", -y, y)) %>%
    ungroup() %>%
    # add labels for plot
    mutate(status_label = case_when(status == "elected" ~ "elected",
                                    status == "notelected" ~ "not elected"),
           gender_label = case_when(gender == "female" ~ "Female candidates",
                                    gender == "male" ~ "Male candidates"),
           dominant_gender = case_when(status == "notelected" ~ "not elected",
                                       status == "elected" & ratio > 1 ~ "Female majority elected",
                                       status == "elected" & ratio < 1 ~ "Male majority elected",
                                       status == "elected" & ratio == 1 ~ "Gender balance")) %>%
    mutate_if(is.character, factor)
	
ggplot() +
    geom_point(data = results_2016_constituency,
               mapping = aes(x = constituency,
                             y = y,
                             color = dominant_gender),
               shape = 19,
               size = 4) +
    geom_blank(data = dummy_constituency,
               mapping = aes(y = y)) +
    facet_share(~ gender_label, 
                dir = "h", 
                scales = "free",
                reverse_num = TRUE) +
    coord_flip() +
    scale_x_discrete(name = NULL, 
                     limits = rev(levels(results_2016_constituency$constituency))) +
    scale_y_continuous(name = NULL, 
                       breaks = NULL) +
    scale_color_manual(name = NULL, 
                       values = c("indianred2", "palegreen3", "skyblue2", "grey87")) +
    theme_minimal() +
    theme(panel.grid = element_blank(),
          legend.position = "bottom",
          strip.text = element_text(size = 12),
          legend.text = element_text(size = 10),
          legend.margin = margin(t = -0.3, unit = 'cm'))
```

![butterfly](/images/blog/r-irish-elections-gender-constituency-butterfly.png "butterfly")

Voila, quite happy with that one. It's striking that in all but one constituency more male candidates ran as compared to female candidates (namely Kildate South). However, even there two men were elected and only one woman. We are not looking of party membership here, so that probably played a more important role in each individual constituency as opposed to gender, but it's a telling sign! Limerick County was the only constituency that ran only male candidates, by the way, while there was no constituency with only female candidates.  We do have a few constituencies though that elected a majority of female candidates, namely Dublin Central, Dublin Rathdown, Dublin South-Central, Meath East and Offaly. Kudos! Honorable mentions also to Cavan-Monaghan, and Dublin West for election a gender balanced number of candidates (obviously that only works in constituencies with an equal number of seats in parliament). 

I'd be interested to see how this changed with this year's election and will update this post once the data becomes available.

### Gender balance by party

Well, while we're at it we might as well just look at the gender balance for each party. While I am not endorsing any party over the other as politics is way too complicated for what we are trying to do here, it is an interesting question nevertheless. We basically do the same thing as before, but this time group by party, not constituency.

```
results_2016_party =
    results_2016 %>%
    group_by(party, gender, status) %>%
    summarise(count = sum(count)) %>%
    ungroup() %>%
    # determine gender ration for plot coloring
    unite(col = "status_gender", gender, status, sep = "_") %>%
    spread(key = status_gender, value = count) %>%
    mutate(ratio = female_elected / male_elected) %>%
    gather(key = category, value = count, -party, -ratio) %>%
    separate(category, into = c("gender", "status")) %>%
    uncount(count) %>%
    # calculate y position (needs to negative for one gender factor level)
    group_by(party, gender) %>%
    mutate(y = sequence(n())) %>%
    mutate(y = ifelse(gender == "female", -y, y)) %>%
    ungroup() %>%
    # add labels for plot
    mutate(status_label = case_when(status == "elected" ~ "elected",
                                    status == "notelected" ~ "not elected"),
           gender_label = case_when(gender == "female" ~ "Female candidates",
                                    gender == "male" ~ "Male candidates"),
           dominant_gender = case_when(status == "notelected" ~ "not elected",
                                       status == "elected" & ratio > 1 ~ "Female majority elected",
                                       status == "elected" & ratio < 1 ~ "Male majority elected",
                                       status == "elected" & ratio == 1 ~ "Gender balance"),
           party_label = case_when(party == "4c" ~ "Independents 4 Change",
                                   party == "aa" ~ "People Before Profit",
                                   party == "cd" ~ "Catholic Democrats",
                                   party == "cp" ~ "Communist Party",
                                   party == "dd" ~ "Direct Democracy Ireland",
                                   party == "ff" ~ "Fianna Fail",
                                   party == "fg" ~ "Fine Gael",
                                   party == "fn" ~ "Fis Nua",
                                   party == "gp" ~ "Green Party",
                                   party == "id" ~ "Irish Democratic Party",
                                   party == "in" ~ "Non-Party Candidates",
                                   party == "lb" ~ "Labour Party",
                                   party == "ri" ~ "Renua Ireland",
                                   party == "sd" ~ "Social Democrats",
                                   party == "sf" ~ "Sinn Fein",
                                   party == "wp" ~ "Worker's Party")) %>%
    mutate_if(is.character, factor)

dummy_party = 
    tibble(y = c(-max(results_2016_party$y), 0, 0, max(results_2016_party$y)),
           gender = c("female", "female", "male", "male")) %>%
    mutate(gender_label = case_when(gender == "female" ~ "Female candidates",
                                    gender == "male" ~ "Male candidates"))
									
ggplot() +
    geom_point(data = results_2016_party,
               mapping = aes(x = party_label,
                             y = y,
                             color = dominant_gender),
               shape = 19,
               size = 2) +
    geom_blank(data = dummy_party,
               mapping = aes(y = y)) +
    facet_share(~ gender_label, 
                dir = "h", 
                scales = "free",
                reverse_num = TRUE) +
    coord_flip() +
    scale_x_discrete(name = NULL, 
                     limits = rev(levels(results_2016_party$party_label))) +
    scale_y_continuous(name = NULL, 
                       breaks = NULL) +
    scale_color_manual(name = NULL,
                       values = c("indianred2", "palegreen3", "skyblue2", "grey87")) +
    theme_minimal() +
    theme(panel.grid = element_blank(),
          legend.position = "bottom",
          strip.text = element_text(size = 12),
          legend.text = element_text(size = 10),
          legend.margin = margin(t = -0.3, unit = 'cm'))
```

Since the plot is so wide (thanks to the independent candidates), I had to adjust the placement of facet strip text a bit in Inkscape. 

![butterfly](/images/blog/r-irish-elections-gender-party-butterfly.png "butterfly")

Only one party got more female candidates elected as compared to male candidates, the Social Democrats. While the Independents4Change and the Green Party got a gender-balanced number of candidates into parliament. All of the major parties ran considerably more male than female candidates, some being a bit better balanced than others, but see for yourself.


