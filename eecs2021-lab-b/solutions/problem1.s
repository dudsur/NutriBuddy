# EECS 2021 Lab B — Problem 1
# Compute: X = (A - B) * 4 + (C >> 2)
# A = 1024, B = 256, C = -64
# Constraints: registers only, shifts not mul/div, result in x5, no memory
#
# Expected: (1024 - 256) * 4 + (-64 >> 2) = 768 * 4 + (-16) = 3056
#                                            x5 = 0x00000BF0

        # Load constants into registers
        addi    x10, x0, 1024       # A = 1024
        addi    x11, x0, 256        # B = 256
        addi    x12, x0, -64        # C = -64

        # (A - B)
        sub     x13, x10, x11       # x13 = A - B = 768

        # * 4  via left shift by 2
        slli    x13, x13, 2         # x13 = 768 << 2 = 3072

        # (C >> 2) arithmetic — signed, so use srai not srli
        srai    x14, x12, 2         # x14 = -64 >> 2 = -16

        # final sum into x5
        add     x5, x13, x14        # x5 = 3072 + (-16) = 3056
