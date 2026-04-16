"use client";

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import { useEffect, useRef } from "react";

type LoadingGlobeProps = {
  className?: string;
  cityLabel?: string;
};

export default function LoadingGlobe({
  className = "",
  cityLabel = "Toronto",
}: LoadingGlobeProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    /* Chart code */
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    const root = am5.Root.new(chartRef.current);

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
    ]);

    // Create the map chart
    // https://www.amcharts.com/docs/v5/charts/map-chart/
    const chart = root.container.children.push(am5map.MapChart.new(root, {
      panX: "rotateX",
      panY: "rotateY",
      projection: am5map.geoOrthographic(),
      paddingBottom: 20,
      paddingTop: 20,
      paddingLeft: 20,
      paddingRight: 20,
    }));

    // Create main polygon series for countries
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    const polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
      geoJSON: am5geodata_worldLow,
    }));

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      toggleKey: "active",
      interactive: true,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: root.interfaceColors.get("primaryButtonHover"),
    });

    // Create series for background fill
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
    const backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
    backgroundSeries.mapPolygons.template.setAll({
      fill: root.interfaceColors.get("alternativeBackground"),
      fillOpacity: 0.1,
      strokeOpacity: 0,
    });
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180),
    });

    // Create graticule series
    // https://www.amcharts.com/docs/v5/charts/map-chart/graticule-series/
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      strokeOpacity: 0.1,
      stroke: root.interfaceColors.get("alternativeBackground"),
    });

    // Rotate animation
    chart.animate({
      key: "rotationX",
      from: 0,
      to: 360,
      duration: 30000,
      loops: Infinity,
    });

    // Make stuff animate on load
    chart.appear(1000, 100);

    chart.setAll({
      panX: "none",
      panY: "none",
      rotationY: -18,
    });
    chart.chartContainer.set("interactive", false);

    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x2979ff),
      stroke: am5.color(0x1a237e),
      strokeWidth: 0.8,
      interactive: false,
    });

    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(0x1a237e),
      fillOpacity: 1,
      strokeOpacity: 0,
    });

    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x2979ff),
      strokeOpacity: 0.22,
    });

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <section
      className={`map-panel panel-loading loading-globe ${className}`.trim()}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="loading-globe__chart-shell">
        <div ref={chartRef} className="loading-globe__chart" aria-hidden="true" />
      </div>
      <p className="loading-globe__label">
        <span className="loading-globe__label-spinner" aria-hidden="true" />
        <span className="loading-globe__label-primary">Loading</span>
        <span className="loading-globe__label-city">{cityLabel}</span>
      </p>
    </section>
  );
}
