FROM java:7
MAINTAINER Nandana Mihindukulasooriya <https://twitter.com/nandanamihindu>

COPY lodrefine-1.0.8 /opt/lodrefine-1.0.8
RUN chmod 755 /opt/lodrefine-1.0.8/refine

#LOD Refine ports
EXPOSE 3333

# Run lod-refine in the foreground
CMD ["/opt/lodrefine-1.0.8/refine"]
