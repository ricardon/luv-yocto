SUMMARY = "Signing tools for PE-COFF binaries"
DESCRIPTION ="Signing tool for PE-COFF binaries, hopefully at least vaguely compliant \
with the PE and Authenticode specifications. This is vaguely analogous to the tool \
described by http://msdn.microsoft.com/en-us/library/8s9b9yaz%28v=vs.80%29.aspx"
HOMEPAGE = "https://github.com/rhinstaller/pesign"
LICENSE = "GPLv2"
LIC_FILES_CHKSUM = "file://COPYING;md5=b234ee4d69f5fce4486a80fdaf4a4263"

SRCREV = "3c2374b57f26f15efa7c883e0fbbbaf3c490d074"
SRC_URI="git://github.com/rhinstaller/pesign.git;branch=master \ 
         file://0001-Makefile-allow-build-environments-modify-variables.patch \
        "
SRC_URI[md5sum] = "0c07e5c6a9152dcf412395f9f29be935"
SRC_URI[sha256sum] = "fdb85e3e9bf0d60d6ea51b5d8f7648610d9633be8ba5632b23ac6ce2425483a5"

S = "${WORKDIR}/git"

DEPENDS = "popt"

BBCLASSEXTEND = "native"

do_compile_class-native() {
     oe_runmake CC="${CC} ${CFLAGS}" LDFLAGS="${LDFLAGS}"
}
