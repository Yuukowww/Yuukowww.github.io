SHELL := /bin/bash

.PHONY: sync-posts sync-dry-run sync-reset sync-status

sync-posts:
	./scripts/sync_posts.sh sync

sync-dry-run:
	./scripts/sync_posts.sh dry-run

sync-reset:
	./scripts/sync_posts.sh reset

sync-status:
	./scripts/sync_posts.sh status