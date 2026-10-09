# EECS 2021 Lab B — Problem 2
# Given X = 0xAB, Y = 0xCD
# Build in x5: bits[31:24]=X, bits[23:16]=Y, bits[15:0]=0
# Allowed only: addi, slli, srli, andi, or
# No memory. Intermediate values visible in registers.
#
# Target: 0xABCD0000

        # Place X into bits [31:24]
        addi    x6, x0, 0xAB        # x6 = 0x000000AB
        slli    x6, x6, 24          # x6 = 0xAB000000

        # Place Y into bits [23:16]
        addi    x7, x0, 0xCD        # x7 = 0x000000CD
        slli    x7, x7, 16          # x7 = 0x00CD0000

        # Merge (lower 16 bits already 0)
        or      x5, x6, x7          # x5 = 0xABCD0000
