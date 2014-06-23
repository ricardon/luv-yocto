# TODO: Do we want this recipe here and keep meta-luv self-contained? Do we
# want this recipe under meta and keep it nice. Eventually, poky OE willmove to
# kexec-tools 2.0.7.

# This looks ugly, but in order to not duplicate kexec-tools.inc, we
# include the file from meta.
require ../../../meta/recipes-kernel/kexec/kexec-tools.inc
export LDFLAGS = "-L${STAGING_LIBDIR}"
EXTRA_OECONF = " --with-zlib=yes"

SRC_URI[md5sum] = "2309ba43981cb6d39d07ac3a9aac30ab"
SRC_URI[sha256sum] = "dde5c38be39882c6c91f0129647349c4e1943b077d3020af1970b481ee954eb0"

PACKAGES =+ "kexec kdump vmcore-dmesg"

FILES_kexec = "${sbindir}/kexec"
FILES_kdump = "${sbindir}/kdump"
FILES_vmcore-dmesg = "${sbindir}/vmcore-dmesg"


