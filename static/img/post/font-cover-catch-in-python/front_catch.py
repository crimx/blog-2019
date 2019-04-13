# -*- coding: utf-8 -*-
import os,sys,re,string
import json,urllib2,cookielib
import eyed3

def mp3_find(source_path):
	mp3_list = []
	for root, dirs, files in os.walk(source_path):
		map(lambda x: mp3_list.append((root, x[:-4])),
			filter(lambda x: x[-4:] == '.mp3', files))
	return mp3_list

def mp3_load(mp3_path, mp3_name):
	try:
		id3 = eyed3.load(os.path.join(mp3_path, mp3_name+'.mp3'))
		return id3
	except IOError:
		print ' '.join([mp3_name,'read error.'])
		sys.exit(1)

def search(ident):
	ident = ident.translate(string.maketrans(string.punctuation,
		'                                '))
	url = r'http://api.douban.com/v2/music/search?count=3&q=' + ident
	try:
		mp3_json = json.load(urllib2.urlopen(url), encoding="utf-8")
		if mp3_json['count'] > 0:
			return re.sub(r'/spic/', r'/lpic/', mp3_json['musics'][0]['image'])
	except (KeyError, ValueError): pass
	return False

def mp3_burn(id3, img):
        id3.tag.images.set(type=3,
                          img_url=None,
                          img_data=urllib2.urlopen(img).read(),
                          mime_type='image/jpeg',
                          description=u"Front cover")
        id3.tag.save(version = (2, 3, 0), encoding = 'latin1')

def mp3_process(mp3_list):
	faild_list = []
	for path, name in mp3_list:
		print 'Writing %s...' %name
		id3 = mp3_load(path, name)
		img = search(' '.join(map(str,filter(lambda x: x,
			[id3.tag.title,id3.tag.artist,id3.tag.album]))))
		if not img: img = search(name)
		if img: mp3_burn(id3, img)
		else: faild_list.append(name)
	return faild_list

if __name__ == '__main__':
	faild_list = mp3_process(mp3_find(r'test'))
	if faild_list: 
		print str(len(faild_list)) + ' file(s) faild.'
		for i in faild_list: print '-- ' + i
	else: print 'Success!'
	