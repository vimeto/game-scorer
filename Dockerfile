FROM node:18 AS runner
WORKDIR /app

COPY . .
COPY package*.json ./

RUN npm ci --legacy-peer-dep
RUN ls -al

ENV NODE_ENV production

RUN npm run build

# RUN npx prisma migrate deploy

# RUN npm run seed

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs
#
# COPY --from=builder /app/public ./public
#
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#
# USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]
