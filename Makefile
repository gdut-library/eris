.PHONY: clean gruntjs prepare content background compilejs make_ext build

name=gdut-library-helper
ext_src_path=src
ext_dest_path=dist
ext_src_js_path=${ext_src_path}/js
ext_dest_js_path=${ext_dest_path}/js
chrome=`ls /usr/bin | grep 'chrom' | head -1`
browserify=browserify
grunt=grunt

dev: prepare compilejs

build: make_ext

make_ext: prepare gruntjs compilejs
	if [ -a ${name}.pem ]; \
	then \
		${chrome} --pack-extension=${ext_dest_path} --pack-extension-key=${name}.pem; \
	else \
		${chrome} --pack-extension=${ext_dest_path}; \
		mv -f ${ext_dest_path}.pem ${name}.pem; \
	fi;
	mv -f ${ext_dest_path}.crx ${name}.crx

compilejs: content background

content:
	for i in `find ${ext_dest_js_path}/content -name '*.js'`; \
	do \
		${browserify} -o $$i.tmp $$i; \
		mv $$i.tmp $$i; \
	done;

background:
	$(eval FILE=${ext_dest_js_path}/background.js)
	${browserify} -o ${FILE}.tmp ${FILE}
	mv ${FILE}.tmp ${FILE}

gruntjs:
	${grunt} default

prepare: clean
	cp -r ${ext_src_path} ${ext_dest_path}

clean:
	rm -rf ${ext_dest_path}
