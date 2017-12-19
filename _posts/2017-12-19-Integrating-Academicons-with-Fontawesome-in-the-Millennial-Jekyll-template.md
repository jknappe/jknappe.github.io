---
layout: post
title: "Integrating Academicons with Font Awesome in the Millennial Jekyll template"
author: "Jan Knappe"
categories: [coding]
tags: [jekyll, academicons, Font Awesome, millenial, github pages, css, scss, social media, windows]
image:
  feature: 17-12-19-academicons/title.jpg
comments: true
---

# Academic social media icons 
Using the [Millennial](https://github.com/LeNPaul/Millennial){:target="_blank"} or other templates in a [Jekyll blog](https://jekyllrb.com/){:target="_blank"} can come with some friction when adjusting the template to your individual needs. For me, it is important to include social media icons both in the header and footer of my blog including links to my academic profiles on, e.g., Researchgate, Google Scholar, Figshare, and OrcID. The generic social media icons bundled in [Font Awesome](http://fontawesome.io/){:target="_blank"} do not include the above mentioned icons; but they can be loaded through [Academicons](http://jpswalsh.github.io/academicons/){:target="_blank"}, an extension to Font Awesome. The inplementation of Academicons with Font Awesome in a pre-defined templates is not as straight forward as integrating both in a custom-built Jekyll. We will have a look at how to achieve the integration within the Millennial template by 

* installing the Academicon icons and .css files on your server, 
* tweeking some of the Millennial template .html files, and 
* adjusting the number of icons appearing in the header and footer, respectively.

# Install Academicons
Academicons is an extension to Font Awesome, providing icons for academic social media sites such as Academia, arXiv, Coursera, dataverse, doi, Figshare, Google Scholar, Mendeley, OrcID, Overleaf, PubMed, Resear Gate, Springer, Zotero, and many more. These icons are not natively included in Font Awesome. 

Firstly, the Academicon fonts and .css classes have to be downloaded from the [Academicon GitHub project page](http://jpswalsh.github.io/academicons/){:target="_blank"}. Copy the `fonts` and `css` folders from the extracted .zip file into your local `/assets` folder in your blog directory. To link this style sheet to your Jekyll template, open `/_includes/head.html` in your preferred text editor and add a reference to the `academicons.css` just before the Font Awesome style sheet is called:

```
<link rel="stylesheet" href="/assets/css/academicons.css">
```

In case of the Millennial theme, the complete list of style sheet calls in `head.html`, should now look like this:

```html
<link rel="stylesheet" href="{{ site.github.url }}/assets/css/main.css">
<link rel="stylesheet" href="{{ site.github.url }}/assets/css/syntax.css">
<!-- RSS-v2.0
<link href="{{ site.github.url }}/feed.xml" type="application/rss+xml" rel="alternate" title="{{ site.data.settings.title }} | {{ site.data.settings.tagline }}"/>
//-->

<link rel="stylesheet" href="/assets/css/academicons.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto|Source+Code+Pro">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css">
```

# Tweek the theme files
To be able to use the new icons on your blog, the template .html files need to be slighty tweeked. We need to, first, define the new icons that we want to use (I will use both the Research Gate and Google Scholar icon as example here), in the `/assets/css/_sass/_social-icons.scss` file and, then, let the template know that these icons are coming from the new Academicon style sheet, and not the standard Font Awesome style sheet. 

### Define the new icons
To be able to use the icons from within the `settings.yml` via

```
social:
- {icon: 'researchgate', link: 'https://www.researchgate.net/profile/profileName'}
- {icon: 'google-scholar', link: 'https://scholar.google.com/citations?user=userID'}
```

we need to add the new icons that we want to use in the `/assets/css/_sass/_social-icons.scss` file. Open the file in your preferred text editor. In order to make use of the mouseover color change effect from the Millennial template, we need to add individual colors for the two new symbols. Following the perceived brand colors for Research Gate and Google Scholar, we add those to the `_social-icons.scss` file:

```
$researchgate-color: #00d09d;
$google-scholar-color: #4788ee;
``` 

Now, we can use these colors in the call to the respective icon and include the instructions for the icons at the end of the file as follows:

```html
.ai-researchgate {
  padding: 5px;
  @include social-media-icon($researchgate-color, $icon-transition-time);
}

.ai-google-scholar {
  padding: 5px;
  @include social-media-icon($google-scholar-color, $icon-transition-time);
}
```

### Differenciate between Font Awesome and Academicons
On default, the template converts all requested social media icons into calls to Font Awesome icons throught the specifications in `/_includes/header.html` and `/_includes/footer.html`. The existing liquid tag code 

{% raw %}
```html
{% for item in site.data.settings.social %}
  <a href="{{ item.link }}" class="menu-link" target="_blank"><i class="fa fa-{{ item.icon }}" aria-hidden="true"></i></a>
{% endfor %}
```
{% endraw %}

will convert all requested social media icons from `/_data/settings.yml` into a call to Font Awesome and create the following .hmtl output:

```html
<i class="fe fe-iconname"></i>
```

What we need, however, is 

```html
<i class="ai ai-iconname"></i>
```

in the .html output for each icon that we want to load from Academicons. To achieve this, we include an `if ... else` in both the `header.html` and `footer.html` do differentiate between the two icon styles. In this example, we test if the requested icon is either for Research Gate or Google Scholar (in which case we call Academicons) or any of the other icons (in which case we call the ususal Font Awesome). We, thus, replace the previous liquid tag code with 

{% raw %}
```html
{% for item in site.data.settings.social %}
  {% if item.icon == 'researchgate' or item.icon == 'google-scholar' %}
    <a href="{{ item.link }}" class="menu-link" target="_blank"><i class="ai ai-{{ item.icon }}" aria-hidden="true"></i></a>
  {% else %}
    <a href="{{ item.link }}" class="menu-link" target="_blank"><i class="fa fa-{{ item.icon }}" aria-hidden="true"></i></a>
  {% endif %}
{% endfor %}
```
{% endraw %}


# Adjust number of icons appearing in header and footer
In case you want to limit the number of social media icons in, let's say, the header (as compared to the footer), you can select the icons using an `if ... elsif ... else` statement in the liquid tag like this:

{% raw %}
```html
{% for item in site.data.settings.social %}
  {% if item.icon == 'google-scholar' %}
    <a href="{{ item.link }}" class="menu-link" target="_blank"><i class="ai ai-{{ item.icon }}" aria-hidden="true"></i></a>
  {% elsif item.icon == 'envelope' or item.icon == 'twitter' or item.icon == 'github' %}
    <a href="{{ item.link }}" class="menu-link" target="_blank"><i class="fa fa-{{ item.icon }}" aria-hidden="true"></i></a>
  {% else %}
    <!--empty-->
{% endif %}
```
{% endraw %}